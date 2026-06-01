import type { CopilotMetrics } from "@/model/Copilot_Metrics";
import type { Metrics } from "@/model/Metrics";
import type { AiAdoptionPhaseAggregate } from "../../shared/types/copilot-usage";

interface MetricsApiResponse {
    metrics: Metrics[];
    usage: CopilotMetrics[];
    adoptionByPhase?: AiAdoptionPhaseAggregate[];
}