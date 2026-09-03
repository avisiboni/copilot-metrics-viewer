import type { H3Event, EventHandlerRequest } from 'h3';
import { Options } from '@/model/Options';
import { fetchTeamMetrics } from '../../shared/utils/team-metrics';

export default defineEventHandler(async (event: H3Event<EventHandlerRequest>) => {
  const logger = console;
  const query = getQuery(event);
  const options = Options.fromQuery(query, useRuntimeConfig(event).public);

  if (options.scope?.includes('team')) {
    return new Response('Use organization or enterprise scope for team comparison.', { status: 422 });
  }

  if (options.scope === 'organization' && !options.githubOrg) {
    return new Response('GitHub organization is not configured.', { status: 422 });
  }

  if (options.scope === 'enterprise' && !options.githubEnt) {
    return new Response('GitHub enterprise is not configured.', { status: 422 });
  }

  if (!event.context.headers?.has('Authorization')) {
    return new Response('No Authentication provided', { status: 401 });
  }

  const teamsParam = query.teams;
  const teamSlugs = typeof teamsParam === 'string'
    ? teamsParam.split(',').map((slug) => slug.trim()).filter(Boolean)
    : Array.isArray(teamsParam)
      ? teamsParam.map(String).filter(Boolean)
      : [];

  if (!teamSlugs.length) {
    return new Response('At least one team slug is required via the teams query parameter.', { status: 422 });
  }

  try {
    const teams = await fetchTeamMetrics(
      options,
      event.context.headers,
      teamSlugs,
      logger
    );

    return { teams };
  } catch (error: unknown) {
    logger.error('Error fetching team metrics:', error);
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message = error instanceof Error ? error.message : String(error);
    return new Response('Error fetching team metrics: ' + message, { status: statusCode });
  }
});
