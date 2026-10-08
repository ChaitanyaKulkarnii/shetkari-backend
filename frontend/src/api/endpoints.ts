import { apiClient } from "./client";
import type { components } from "../types/api";

type HealthResponse = components["schemas"]["HealthResponse"];
type AdvisoryRequest = components["schemas"]["AdvisoryRequest"];
type HarvestFeedbackRequest = components["schemas"]["HarvestFeedbackRequest"];
type HarvestFeedbackResponse = components["schemas"]["HarvestFeedbackResponse"];
type RetrainResponse = components["schemas"]["RetrainResponse"];

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await apiClient.get<HealthResponse>("/api/health");
  return data;
};

export const getOptions = async (): Promise<any> => {
  const { data } = await apiClient.get<any>("/api/options");
  return data;
};

export const getModelCard = async (): Promise<any> => {
  const { data } = await apiClient.get<any>("/api/model-card");
  return data;
};

export const getMarketReport = async (): Promise<any> => {
  const { data } = await apiClient.get<any>("/api/market");
  return data;
};

export const createAdvisory = async (req: AdvisoryRequest): Promise<any> => {
  const { data } = await apiClient.post<any>("/api/advisory", req);
  return data;
};

export const submitHarvestFeedback = async (
  req: HarvestFeedbackRequest
): Promise<HarvestFeedbackResponse> => {
  const { data } = await apiClient.post<HarvestFeedbackResponse>(
    "/api/harvest-feedback",
    req
  );
  return data;
};

export const retrainHarvestModel = async (
  apiKey: string
): Promise<RetrainResponse> => {
  const { data } = await apiClient.post<RetrainResponse>("/api/retrain-harvest", null, {
    headers: {
      "X-API-Key": apiKey,
    },
  });
  return data;
};
