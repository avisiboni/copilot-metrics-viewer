import { convertToMetrics } from '@/model/MetricsToUsageConverter';
import type { MetricsApiResponse } from "@/types/metricsApiResponse";
import { getMetricsData } from '../../shared/utils/metrics-util';
import { Options } from '@/model/Options';
import { buildAdoptionPhaseView } from '../../shared/utils/ai-adoption-phase';
import { fetch28DayAdoptionPhases } from '../../shared/utils/usage-metrics-report';

// TODO: use for storage https://unstorage.unjs.io/drivers/azure

export default defineEventHandler(async (event) => {

    const logger = console;

    try {
        // usage is the new API Format
        const usageData = await getMetricsData(event);

        // metrics is the old API format
        const metricsData = convertToMetrics(usageData);

        let adoptionByPhase = [];
        try {
            const options = Options.fromQuery(getQuery(event), useRuntimeConfig(event).public);
            if (event.context.headers?.has('Authorization')) {
                const orgTotals = await fetch28DayAdoptionPhases(
                    options,
                    event.context.headers,
                    logger
                );
                adoptionByPhase = buildAdoptionPhaseView(orgTotals, []);
            }
        } catch (adoptionError) {
            logger.warn('Adoption phase rollup unavailable for metrics:', adoptionError);
        }

        const result = { metrics: metricsData, usage: usageData, adoptionByPhase } as MetricsApiResponse;
        return result;
    } catch (error: unknown) {
        logger.error('Error fetching metrics data:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const statusCode = (error && typeof error === 'object' && 'statusCode' in error)
            ? (error as { statusCode: number }).statusCode
            : 500;
        return new Response('Error fetching metrics data: ' + errorMessage, { status: statusCode });
    }
})

