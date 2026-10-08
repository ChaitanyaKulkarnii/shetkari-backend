import { z } from "zod";

export const advisorySchema = z.object({
  name: z.string().optional().nullable(),
  taluka: z.string().min(1, "Please select a taluka"),
  crop: z.string().min(1, "Please select a crop"),
  sowing_date: z.string().refine((date) => {
    const d = new Date(date);
    const now = new Date();
    return d <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }, "Sowing date cannot be in the future"),
  soil: z.string().min(1, "Please select soil type"),
  variety: z.string().min(1, "Please select variety"),
  acres: z.number().positive("Acres must be greater than 0"),
  storage_cost: z.number().min(0),
  interest_rate: z.number().min(0),
});

export const feedbackSchema = z.object({
  taluka: z.string().optional().nullable(),
  variety: z.string().min(1, "Please select variety"),
  sowing_date: z.string().min(1, "Please enter sowing date"),
  harvest_date: z.string().min(1, "Please enter harvest date"),
}).refine((data) => {
  const sowing = new Date(data.sowing_date);
  const harvest = new Date(data.harvest_date);
  return harvest > sowing;
}, {
  message: "Harvest date must be after sowing date",
  path: ["harvest_date"],
});

export type AdvisoryFormValues = z.infer<typeof advisorySchema>;
export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
