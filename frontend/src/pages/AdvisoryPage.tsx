import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advisorySchema, type AdvisoryFormValues } from "../lib/validation";
import { useOptions, useCreateAdvisory } from "../api/queries";
import { Button, Alert, AlertTitle, AlertDescription, Skeleton, cn } from "../components/ui";
import { formatCurrency } from "../lib/format";
import { Calendar, Leaf, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdvisoryPage() {
  const { data: options, isLoading: optionsLoading, isError: optionsError, refetch } = useOptions();
  const createAdvisory = useCreateAdvisory();

  const form = useForm<AdvisoryFormValues>({
    resolver: zodResolver(advisorySchema),
    defaultValues: {
      name: "",
      taluka: "",
      crop: "Soybean",
      sowing_date: "",
      soil: "",
      variety: "",
      acres: undefined,
      storage_cost: 15,
      interest_rate: 1,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("farmerProfile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) form.setValue("name", parsed.name);
        if (parsed.taluka) form.setValue("taluka", parsed.taluka);
        if (parsed.acres) form.setValue("acres", parsed.acres);
        if (parsed.storage_cost !== undefined) form.setValue("storage_cost", parsed.storage_cost);
        if (parsed.interest_rate !== undefined) form.setValue("interest_rate", parsed.interest_rate);
      } catch (e) {}
    }
  }, [form]);

  const onSubmit = (data: AdvisoryFormValues) => {
    localStorage.setItem(
      "farmerProfile",
      JSON.stringify({ 
        name: data.name, 
        taluka: data.taluka, 
        acres: data.acres,
        storage_cost: data.storage_cost,
        interest_rate: data.interest_rate 
      })
    );

    createAdvisory.mutate(
      {
        ...data,
        name: data.name ?? null,
        acres: Number(data.acres),
        storage_cost: Number(data.storage_cost),
        interest_rate: Number(data.interest_rate) / 100,
      },
      {
        onError: (err: any) => {
          if (err.status === 422 && Array.isArray(err.detail)) {
            err.detail.forEach((issue: any) => {
              const field = issue.loc[issue.loc.length - 1];
              form.setError(field as any, { message: issue.msg });
            });
          }
        },
      }
    );
  };

  if (optionsError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Server is not reachable</AlertTitle>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  const res = createAdvisory.data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#1F2420]">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2420] flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#426039]" /> Sangli Soybean Crop Advisory
          </h1>
          <p className="text-xs sm:text-sm text-[#5E645C] mt-0.5">
            Calibrated harvest predictions, yield forecasts, and mandi storage timing for Sangli farmers.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#426039] hover:underline font-semibold"
        >
          Back to Analyze Your Crop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Form */}
        <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0 space-y-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 bg-[#FFFFFF] p-5 rounded-[16px] border border-[#E4E8E1] text-sm shadow-xs"
          >
            {createAdvisory.isError && (createAdvisory.error as any).status !== 422 && (
              <Alert variant="destructive" className="p-3">
                <AlertTitle className="text-sm">{(createAdvisory.error as any).error || "Error"}</AlertTitle>
                <AlertDescription className="text-xs">{(createAdvisory.error as any).detail as string}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Name</label>
              <input
                type="text"
                placeholder="Farmer name"
                className={cn(
                  "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                  form.formState.errors.name && "border-red-500"
                )}
                {...form.register("name")}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Taluka</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-8.5 bg-[#EFF4EC]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                    form.formState.errors.taluka && "border-red-500"
                  )}
                  {...form.register("taluka")}
                >
                  <option value="">Select Taluka</option>
                  {options?.talukas?.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Crop</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-8.5 bg-[#EFF4EC]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-8.5 rounded-md bg-[#EFF4EC] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                    form.formState.errors.crop && "border-red-500"
                  )}
                  {...form.register("crop")}
                >
                  {options?.crops?.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Sowing Date</label>
              <input
                type="date"
                className={cn(
                  "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                  form.formState.errors.sowing_date && "border-red-500"
                )}
                {...form.register("sowing_date")}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Soil</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-8.5 bg-[#EFF4EC]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                    form.formState.errors.soil && "border-red-500"
                  )}
                  {...form.register("soil")}
                >
                  <option value="">Select Soil</option>
                  {options?.soils?.map((s: string) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Variety</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-8.5 bg-[#EFF4EC]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                    form.formState.errors.variety && "border-red-500"
                  )}
                  {...form.register("variety")}
                >
                  <option value="">Select Variety</option>
                  {Object.entries(options?.varieties || {}).map(([v, label]) => (
                    <option key={v} value={v}>{label as string}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2 pb-2 border-b border-[#E4E8E1]">
              <label className="font-semibold text-[#1F2420] w-24 shrink-0 text-xs">Acres</label>
              <input
                type="number"
                step="0.1"
                placeholder="5"
                className={cn(
                  "flex-1 h-8.5 rounded-md bg-[#FFFFFF] border border-[#E4E8E1] text-[#1F2420] px-2.5 focus:border-[#426039] focus:ring-1 focus:ring-[#426039] outline-none text-xs",
                  form.formState.errors.acres && "border-red-500"
                )}
                {...form.register("acres", { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="font-semibold text-[#5E645C] w-24 shrink-0 text-xs">Storage ₹/q/mo</label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                className="flex-1 accent-[#426039]"
                {...form.register("storage_cost", { valueAsNumber: true })}
              />
              <span className="w-10 text-right text-xs text-[#5E645C] font-mono">
                {form.watch("storage_cost")?.toFixed(0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#5E645C] w-24 shrink-0 text-xs">Interest %/mo</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                className="flex-1 accent-[#426039]"
                {...form.register("interest_rate", { valueAsNumber: true })}
              />
              <span className="w-10 text-right text-xs text-[#5E645C] font-mono">
                {form.watch("interest_rate")?.toFixed(1)}%
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#426039] hover:bg-[#344d2d] text-white font-semibold rounded-md h-9 mt-3 text-xs tracking-normal transition-colors cursor-pointer"
              disabled={createAdvisory.isPending || optionsLoading}
            >
              {createAdvisory.isPending ? "Calculating..." : "Calculate Farm Advisory"}
            </Button>
          </form>
        </div>

        {/* Advisory Output */}
        <div className="flex-1">
          {res ? (
            <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[16px] shadow-xs overflow-hidden text-[#1F2420]">
              <div className="p-6">
                <h2 className="text-lg font-bold text-[#1F2420] flex items-center gap-2 mb-1">
                  🌱 {res.farmer.name || "Farmer"} – Soybean Advisory Report
                </h2>
                <p className="text-xs text-[#5E645C] mb-5 pb-3 border-b border-[#E4E8E1]">
                  {res.farmer.taluka}, Sangli • {res.farmer.soil} soil • {res.farmer.acres} acres • {res.farmer.variety}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#EFF4EC] p-4 rounded-xl border border-[#E4E8E1]">
                    <div className="flex items-center gap-2 text-xs text-[#426039] font-semibold mb-1.5">
                      <Calendar className="w-4 h-4" /> Harvest Window
                    </div>
                    <div className="text-2xl font-bold text-[#1F2420] mb-0.5">{res.harvest.expected_date}</div>
                    <div className="text-xs text-[#5E645C]">
                      Window: {res.harvest.window[0]} → {res.harvest.window[1]}
                    </div>
                    <div className="text-xs font-medium text-[#426039] mt-1">
                      {res.harvest.days_to_harvest > 0
                        ? `(in ${res.harvest.days_to_harvest} days)`
                        : `(${Math.abs(res.harvest.days_to_harvest)} days ago)`}
                    </div>
                  </div>

                  <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E4E8E1]">
                    <div className="flex items-center gap-2 text-xs text-[#1F2420] font-semibold mb-1.5">
                      <Leaf className="w-4 h-4 text-[#426039]" /> Current Crop Stage
                    </div>
                    <div className="text-2xl font-bold text-[#1F2420] mb-0.5 capitalize">{res.harvest.crop_stage}</div>
                    <div className="text-xs text-[#5E645C] mt-1">
                      {res.harvest.days_after_sowing} days after sowing ({new Date(res.farmer.sowing_date).toISOString().split('T')[0]})
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#1F2420] mb-5 bg-[#EFF4EC] p-3 rounded-lg border border-[#E4E8E1]">
                  <strong className="text-[#426039]">Agronomic Stage Tip:</strong> {res.harvest.stage_tip}
                </div>

                <div className="bg-[#FEF2F2] border border-red-200 p-4 rounded-xl mb-4 text-xs relative">
                  <div className="flex items-start gap-2 mb-1">
                    <span>💰</span>
                    <div>
                      <span className="font-semibold text-[#1F2420]">Selling Strategy: </span>
                      <span className="text-red-700 font-bold uppercase">{res.advisory.decision} (in phases)</span>
                      <span className="text-[#5E645C]"> (target: {res.advisory.sell_when}) – est. ₹{res.advisory.expected_net_price}/q</span>
                    </div>
                  </div>
                  <div className="ml-6 text-[#1F2420] mb-1">{res.advisory.reason}</div>
                  <div className="ml-6 text-[#426039] font-medium mb-1">मराठी: {res.advisory.reason_marathi}</div>
                  <div className="ml-6 text-[#5E645C] text-[11px]">Mandi benchmark: ₹{res.market.analysis.price_now}/q as of {res.market.analysis.as_of.split('T')[0]}</div>
                </div>

                <div className="text-xs text-[#1F2420] mb-4 flex items-start gap-2">
                  <span>📈</span>
                  <div>
                    <span className="font-medium text-[#5E645C]">Yield outlook:</span> {res.yield_outlook.kg_per_ha.expected.toFixed(0)} kg/ha
                    (range {res.yield_outlook.kg_per_ha.low.toFixed(0)} – {res.yield_outlook.kg_per_ha.high.toFixed(0)}) → 
                    <span className="font-bold text-[#426039]"> {res.yield_outlook.production_quintals.expected.toFixed(0)} quintals </span> 
                    ({res.yield_outlook.production_quintals.low.toFixed(0)}–{res.yield_outlook.production_quintals.high.toFixed(0)}) – 
                    est. revenue {formatCurrency(res.advisory.revenue_inr.expected)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#1F2420] text-xs mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Agronomic Alerts
                  </div>
                  <ul className="space-y-1 text-xs pl-5 list-disc text-[#5E645C]">
                    {res.alerts?.map((alert: string, i: number) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[380px] border border-[#E4E8E1] rounded-[16px] border-dashed flex flex-col items-center justify-center text-[#5E645C] p-8 text-center bg-[#FFFFFF]">
              <Leaf className="w-10 h-10 mb-3 text-[#426039]/40" />
              <p className="text-base font-semibold text-[#1F2420] mb-1">Ready to calculate your farm advisory</p>
              <p className="text-xs max-w-sm text-[#5E645C]">
                Select your taluka and farm parameters on the left to receive customized harvest predictions and Sangli mandi storage guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
