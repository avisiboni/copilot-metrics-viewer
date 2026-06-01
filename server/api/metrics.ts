import { convertToMetrics } from '@/model/MetricsToUsageConverter';
import type { MetricsApiResponse } from "@/types/metricsApiResponse";
import { getMetricsDataV2 } from '../../shared/utils/metrics-util-v2';
import { Options } from '@/model/Options';
import { buildAdoptionPhaseView } from '../../shared/utils/ai-adoption-phase';
import { fetch28DayAdoptionPhases } from '../../shared/utils/usage-metrics-report';

function sortMetricsByDay<T extends { day: string }>(metrics: T[]): T[] {
    return [...metrics].sort((left, right) => left.day.localeCompare(right.day));
}

export default defineEventHandler(async (event) => {

    const logger = console;

    try {
        const { metrics: usageData, reportData } = await getMetricsDataV2(event);

        const metricsData = sortMetricsByDay(convertToMetrics(usageData));

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

        const result = {
            metrics: metricsData,
            usage: usageData,
            reportData,
            adoptionByPhase
        } as MetricsApiResponse;
        return result;
    } catch (error: unknown) {
        logger.error('Error fetching metrics data:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const statusCode = (error && typeof error === 'object' && 'statusCode' in error)
            ? (error as { statusCode: number }).statusCode
            : 500;
        throw createError({ statusCode, statusMessage: 'Error fetching metrics data: ' + errorMessage });
    }
})
