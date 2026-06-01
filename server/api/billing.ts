import type { H3Event, EventHandlerRequest } from 'h3';
import { Options } from '@/model/Options';
import type { CopilotBillingSettings } from '../../shared/types/copilot-usage';

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const logger = console;
  const query = getQuery(event);
  const options = Options.fromQuery(query, useRuntimeConfig(event).public);

  if (options.scope?.includes('team') || options.scope === 'enterprise') {
    return { billing: null, message: 'Billing settings are only available for organization scope.' };
  }

  if (!options.githubOrg) {
    return new Response('GitHub organization is not configured.', { status: 422 });
  }

  if (!event.context.headers?.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 });
  }

  try {
    const billing = await $fetch<CopilotBillingSettings>(
      `https://api.github.com/orgs/${options.githubOrg}/copilot/billing`,
      { headers: event.context.headers }
    );

    return { billing };
  } catch (error: unknown) {
    logger.error('Error fetching Copilot billing settings:', error);
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message = error instanceof Error ? error.message : String(error);
    return new Response('Error fetching billing settings: ' + message, { status: statusCode });
  }
});
