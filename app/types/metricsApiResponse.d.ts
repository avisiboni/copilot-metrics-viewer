import type { CopilotMetrics } from "@/model/Copilot_Metrics";
import type { Metrics } from "@/model/Metrics";
import type { AiAdoptionPhaseAggregate } from "../../shared/types/copilot-usage";
import type { ReportDayTotals } from "../../server/services/github-copilot-usage-api";

interface MetricsApiResponse {
    metrics: Metrics[];
    usage: CopilotMetrics[];
    reportData?: ReportDayTotals[];
    adoptionByPhase?: AiAdoptionPhaseAggregate[];
}

export type { MetricsApiResponse };
