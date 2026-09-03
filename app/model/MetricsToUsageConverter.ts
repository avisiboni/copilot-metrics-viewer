import { Metrics, BreakdownData } from "@/model/Metrics";
import type { CopilotMetrics } from '@/model/Copilot_Metrics';

export const convertToMetrics = (copilotMetrics: CopilotMetrics[]): Metrics[] => {
  try {
    if (!copilotMetrics || copilotMetrics.length === 0) {
      return [];
    }

    const usageData: Metrics[] = copilotMetrics.map(metric => {
      if (!metric) {
        return new Metrics({
          day: '',
          total_suggestions_count: 0,
          total_acceptances_count: 0,
          total_lines_suggested: 0,
          total_lines_accepted: 0,
          total_active_users: 0,
          total_chat_acceptances: 0,
          total_chat_turns: 0,
          total_active_chat_users: 0,
          breakdown: []
        });
      }

      const breakdown: BreakdownData[] = [];

      const completions = metric.copilot_ide_code_completions as any;
      const chat = metric.copilot_ide_chat as any;

      const hasAggregateLanguageBreakdown = Array.isArray(completions?.languages) &&
        completions.languages.some((language: any) =>
          language && (
            language.total_code_suggestions !== undefined ||
            language.total_code_acceptances !== undefined ||
            language.total_code_lines_suggested !== undefined ||
            language.total_code_lines_accepted !== undefined
          )
        );

      const hasAggregateEditorBreakdown = Array.isArray(completions?.editors) &&
        completions.editors.some((editor: any) =>
          editor && (
            editor.total_code_suggestions !== undefined ||
            editor.total_code_acceptances !== undefined ||
            editor.total_code_lines_suggested !== undefined ||
            editor.total_code_lines_accepted !== undefined
          )
        );

      if (hasAggregateLanguageBreakdown) {
        completions.languages.forEach((language: any) => {
          if (!language?.name) {
            return;
          }
          breakdown.push(new BreakdownData({
            language: language.name,
            editor: '',
            suggestions_count: language.total_code_suggestions || 0,
            acceptances_count: language.total_code_acceptances || 0,
            lines_suggested: language.total_code_lines_suggested || 0,
            lines_accepted: language.total_code_lines_accepted || 0,
            active_users: language.total_engaged_users || 0
          }));
        });
      } else {
        metric.copilot_ide_code_completions?.editors?.forEach(editor => {
          if (editor && editor.models) {
            editor.models.forEach(model => {
              if (model && model.languages) {
                model.languages.forEach(language => {
                  if (language) {
                    breakdown.push(new BreakdownData({
                      language: language.name,
                      editor: editor.name,
                      suggestions_count: (language as any).total_code_suggestions || 0,
                      acceptances_count: (language as any).total_code_acceptances || 0,
                      lines_suggested: (language as any).total_code_lines_suggested || 0,
                      lines_accepted: (language as any).total_code_lines_accepted || 0,
                      active_users: language.total_engaged_users || 0
                    }));
                  }
                });
              }
            });
          }
        });
      }

      if (hasAggregateEditorBreakdown) {
        completions.editors.forEach((editor: any) => {
          if (!editor?.name) {
            return;
          }
          breakdown.push(new BreakdownData({
            language: '',
            editor: editor.name,
            suggestions_count: editor.total_code_suggestions || 0,
            acceptances_count: editor.total_code_acceptances || 0,
            lines_suggested: editor.total_code_lines_suggested || 0,
            lines_accepted: editor.total_code_lines_accepted || 0,
            active_users: editor.total_engaged_users || 0
          }));
        });
      }

      const totalChatInsertions = chat?.total_chat_insertion_events ?? (metric.copilot_ide_chat?.editors?.reduce((sum, editor) => {
        if (editor && editor.models) {
          return sum + editor.models.reduce((modelSum, model) => {
            return modelSum + (model?.total_chat_insertion_events || 0);
          }, 0);
        }
        return sum;
      }, 0) || 0);

      const totalChatCopies = chat?.total_chat_copy_events ?? (metric.copilot_ide_chat?.editors?.reduce((sum, editor) => {
        if (editor && editor.models) {
          return sum + editor.models.reduce((modelSum, model) => {
            return modelSum + (model?.total_chat_copy_events || 0);
          }, 0);
        }
        return sum;
      }, 0) || 0);

      const totalChatTurns = chat?.total_chats ?? (metric.copilot_ide_chat?.editors?.reduce((sum, editor) => {
        if (editor && editor.models) {
          return sum + editor.models.reduce((modelSum, model) => {
            return modelSum + (model?.total_chats || 0);
          }, 0);
        }
        return sum;
      }, 0) || 0);

      const totalSuggestionsCount = completions?.total_code_suggestions ?? breakdown
        .filter(item => item.language)
        .reduce((sum: number, item: BreakdownData) => sum + (item.suggestions_count || 0), 0);

      const totalAcceptancesCount = completions?.total_code_acceptances ?? breakdown
        .filter(item => item.language)
        .reduce((sum: number, item: BreakdownData) => sum + (item.acceptances_count || 0), 0);

      const totalLinesSuggested = completions?.total_code_lines_suggested ?? breakdown
        .filter(item => item.language)
        .reduce((sum: number, item: BreakdownData) => sum + (item.lines_suggested || 0), 0);

      const totalLinesAccepted = completions?.total_code_lines_accepted ?? breakdown
        .filter(item => item.language)
        .reduce((sum: number, item: BreakdownData) => sum + (item.lines_accepted || 0), 0);

      return new Metrics({
        day: metric.date,
        total_suggestions_count: totalSuggestionsCount,
        total_acceptances_count: totalAcceptancesCount,
        total_lines_suggested: totalLinesSuggested,
        total_lines_accepted: totalLinesAccepted,
        total_active_users: metric.total_active_users || 0,
        total_chat_acceptances: totalChatInsertions + totalChatCopies,
        total_chat_turns: totalChatTurns,
        total_active_chat_users: metric.copilot_ide_chat?.total_engaged_users || 0,
        breakdown: breakdown
      });
    });

    return usageData;
  } catch (error) {
    console.error('Error converting metrics to usage format:', error);
    return [];
  }
};