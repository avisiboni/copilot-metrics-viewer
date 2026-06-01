import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import { brandChartPalette } from '@/utils/brand-colors';
import { usageNumber } from '../../shared/types/copilot-usage';
import { getMetricsData } from '../../shared/utils/metrics-util';
import { safeApiErrorMessage } from '../../shared/utils/safe-error-message';

function apiLineDataset(label: string, data: number[], index: number) {
  const c = brandChartPalette[index % brandChartPalette.length]!;
  return {
    label,
    data,
    borderColor: c.border,
    backgroundColor: c.bg,
    borderWidth: 2,
    tension: 0.25,
    fill: false
  };
}

interface GitHubStats {
  totalIdeCodeCompletionUsers: number;
  totalIdeChatUsers: number;
  totalCliUsers: number;
  totalCodeReviewActiveUsers: number;
  totalCodeReviewPassiveUsers: number;
  totalAgentLocAdded: number;
  totalAgentLocDeleted: number;
  totalIdeCodeCompletionModels: number;
  totalIdeChatModels: number;
  ideCodeCompletionModels: Array<Record<string, unknown>>;
  ideChatModels: Array<Record<string, unknown>>;
  featureUsageChartData: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
  activeUsersChartData: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
  chatModeChartData: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
  cliChartData: {
    labels: string[];
    datasets: Array<Record<string, unknown>>;
  };
}

export default defineEventHandler(async (event) => {
  try {
    const metricsData = await getMetricsData(event);
    return calculateUsageInsights(metricsData);
  } catch (error) {
    const logger = console;
    logger.error('Error in github-stats endpoint:', error);
    const statusCode = (error && typeof error === 'object' && 'statusCode' in error)
      ? (error as { statusCode: number }).statusCode
      : 500;
    return new Response(
      safeApiErrorMessage(error, 'Error fetching metrics data'),
      { status: statusCode }
    );
  }
});

function calculateUsageInsights(metrics: CopilotMetrics[]): GitHubStats {
  const labels = metrics.map((metric) => metric.date);

  const totals = metrics.reduce(
    (acc, metric) => {
      const detail = metric.usage_detail;
      acc.totalIdeCodeCompletionUsers += metric.copilot_ide_code_completions?.total_engaged_users || 0;
      acc.totalIdeChatUsers += metric.copilot_ide_chat?.total_engaged_users || 0;
      acc.totalCliUsers += usageNumber(detail?.daily_active_cli_users);
      acc.totalCodeReviewActiveUsers += usageNumber(detail?.daily_active_copilot_code_review_users);
      acc.totalCodeReviewPassiveUsers += usageNumber(detail?.daily_passive_copilot_code_review_users);
      acc.totalAgentLocAdded += metric.agent_edit_summary?.loc_added_sum || 0;
      acc.totalAgentLocDeleted += metric.agent_edit_summary?.loc_deleted_sum || 0;
      return acc;
    },
    {
      totalIdeCodeCompletionUsers: 0,
      totalIdeChatUsers: 0,
      totalCliUsers: 0,
      totalCodeReviewActiveUsers: 0,
      totalCodeReviewPassiveUsers: 0,
      totalAgentLocAdded: 0,
      totalAgentLocDeleted: 0
    }
  );

  const modelSets = { ideCodeCompletion: new Set<string>(), ideChat: new Set<string>() };
  const modelMaps = {
    ideCodeCompletion: new Map<string, Record<string, unknown>>(),
    ideChat: new Map<string, Record<string, unknown>>()
  };

  for (const metric of metrics) {
    const completionModels = (metric.copilot_ide_code_completions as { models?: Array<{ name: string; total_engaged_users?: number; is_custom_model?: boolean }> })?.models || [];
    for (const model of completionModels) {
      modelSets.ideCodeCompletion.add(model.name);
      const key = model.name;
      if (!modelMaps.ideCodeCompletion.has(key)) {
        modelMaps.ideCodeCompletion.set(key, {
          name: model.name,
          editor: 'all ides',
          model_type: model.is_custom_model ? 'Custom' : 'Default',
          total_engaged_users: 0
        });
      }
      const entry = modelMaps.ideCodeCompletion.get(key)!;
      entry.total_engaged_users = (entry.total_engaged_users as number) + (model.total_engaged_users || 0);
    }

    metric.copilot_ide_chat?.editors?.forEach((editor) => {
      editor.models?.forEach((model) => {
        modelSets.ideChat.add(model.name);
        const key = `${model.name}-${editor.name}`;
        if (!modelMaps.ideChat.has(key)) {
          modelMaps.ideChat.set(key, {
            name: model.name,
            editor: editor.name,
            model_type: model.is_custom_model ? 'Custom' : 'Default',
            total_engaged_users: 0,
            total_chats: 0
          });
        }
        const entry = modelMaps.ideChat.get(key)!;
        entry.total_engaged_users = (entry.total_engaged_users as number) + (model.total_engaged_users || 0);
        entry.total_chats = (entry.total_chats as number) + (model.total_chats || 0);
      });
    });
  }

  const chatModeLabels = ['ask', 'edit', 'plan', 'agent', 'custom', 'unknown'];
  const chatModeDatasets = chatModeLabels.map((mode, index) =>
    apiLineDataset(
      `Chat: ${mode}`,
      metrics.map((metric) => {
        const breakdown = (metric.copilot_ide_chat as {
          chat_mode_breakdown?: Array<{ mode: string; total_chats?: number }>
        })?.chat_mode_breakdown;
        const modeData = breakdown?.find((item) => item.mode === mode);
        return modeData?.total_chats || 0;
      }),
      index
    )
  );

  return {
    ...totals,
    totalIdeCodeCompletionModels: modelSets.ideCodeCompletion.size,
    totalIdeChatModels: modelSets.ideChat.size,
    ideCodeCompletionModels: Array.from(modelMaps.ideCodeCompletion.values()),
    ideChatModels: Array.from(modelMaps.ideChat.values()),
    featureUsageChartData: {
      labels,
      datasets: [
        apiLineDataset(
          'IDE Completions (acceptances)',
          metrics.map((m) => m.copilot_ide_code_completions?.total_code_acceptances || 0),
          0
        ),
        apiLineDataset(
          'IDE Chat (prompts)',
          metrics.map((m) => m.copilot_ide_chat?.total_chats || 0),
          1
        ),
        apiLineDataset(
          'Agent LoC added',
          metrics.map((m) => m.agent_edit_summary?.loc_added_sum || 0),
          2
        )
      ]
    },
    activeUsersChartData: {
      labels,
      datasets: [
        apiLineDataset(
          'DAU',
          metrics.map((m) => usageNumber(m.usage_detail?.daily_active_users ?? m.total_active_users)),
          0
        ),
        apiLineDataset(
          'WAU',
          metrics.map((m) => usageNumber(m.usage_detail?.weekly_active_users)),
          2
        ),
        apiLineDataset(
          'MAU',
          metrics.map((m) => usageNumber(m.usage_detail?.monthly_active_users)),
          3
        )
      ]
    },
    chatModeChartData: {
      labels,
      datasets: chatModeDatasets
    },
    cliChartData: {
      labels,
      datasets: [
        apiLineDataset(
          'CLI active users',
          metrics.map((m) => usageNumber(m.usage_detail?.daily_active_cli_users)),
          1
        ),
        apiLineDataset(
          'CLI requests',
          metrics.map((m) => usageNumber(m.usage_detail?.totals_by_cli?.request_count)),
          4
        )
      ]
    }
  };
}
