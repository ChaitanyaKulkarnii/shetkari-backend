import { useQuery, useMutation } from "@tanstack/react-query";
import * as api from "./endpoints";

export const useHealth = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

export const useOptions = () =>
  useQuery({
    queryKey: ["options"],
    queryFn: api.getOptions,
    staleTime: Infinity, // Options rarely change
  });

export const useModelCard = () =>
  useQuery({
    queryKey: ["modelCard"],
    queryFn: api.getModelCard,
    staleTime: Infinity,
  });

export const useMarketReport = () =>
  useQuery({
    queryKey: ["marketReport"],
    queryFn: api.getMarketReport,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

export const useCreateAdvisory = () =>
  useMutation({
    mutationFn: api.createAdvisory,
  });

export const useSubmitFeedback = () =>
  useMutation({
    mutationFn: api.submitHarvestFeedback,
  });

export const useRetrainModel = () =>
  useMutation({
    mutationFn: api.retrainHarvestModel,
  });
