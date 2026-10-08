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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#22C55E]" /> Sangli Soybean Crop Advisory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detailed agronomic predictions, harvest windows, yield estimates, and mandi storage timing.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#22C55E] hover:text-[#4ADE80] font-medium"
        >
          Back to AI Crop Analyzer <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Form */}
        <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0 space-y-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 bg-[#171B22] p-5 rounded-xl border border-[#232936] text-sm shadow-xl"
          >
            {createAdvisory.isError && (createAdvisory.error as any).status !== 422 && (
              <Alert variant="destructive" className="p-3">
                <AlertTitle className="text-sm">{(createAdvisory.error as any).error || "Error"}</AlertTitle>
                <AlertDescription className="text-xs">{(createAdvisory.error as any).detail as string}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-300 w-24 shrink-0">Name</label>
              <input
                type="text"
                placeholder="Farmer name"
                className={cn(
                  "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
                  form.formState.errors.name && "border-red-500"
                )}
                {...form.register("name")}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-300 w-24 shrink-0">Taluka</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-9 bg-[#232936]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
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
              <label className="font-semibold text-slate-300 w-24 shrink-0">Crop</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-9 bg-[#232936]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
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
              <label className="font-semibold text-slate-300 w-24 shrink-0">Sowing Date</label>
              <input
                type="date"
                className={cn(
                  "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
                  form.formState.errors.sowing_date && "border-red-500"
                )}
                {...form.register("sowing_date")}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-300 w-24 shrink-0">Soil</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-9 bg-[#232936]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
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
              <label className="font-semibold text-slate-300 w-24 shrink-0">Variety</label>
              {optionsLoading ? (
                <Skeleton className="flex-1 h-9 bg-[#232936]" />
              ) : (
                <select
                  className={cn(
                    "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
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

            <div className="flex items-center gap-2 pb-2 border-b border-[#232936]">
              <label className="font-semibold text-slate-300 w-24 shrink-0">Acres</label>
              <input
                type="number"
                step="0.1"
                placeholder="5"
                className={cn(
                  "flex-1 h-9 rounded-lg bg-[#0E1116] border border-[#232936] text-white px-3 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] outline-none text-sm",
                  form.formState.errors.acres && "border-red-500"
                )}
                {...form.register("acres", { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="font-semibold text-slate-300 w-24 shrink-0 text-xs">Storage ₹/q/mo</label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                className="flex-1 accent-[#22C55E]"
                {...form.register("storage_cost", { valueAsNumber: true })}
              />
              <span className="w-10 text-right text-xs text-slate-400 font-mono">
                {form.watch("storage_cost")?.toFixed(0)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-slate-300 w-24 shrink-0 text-xs">Interest %/mo</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                className="flex-1 accent-[#22C55E]"
                {...form.register("interest_rate", { valueAsNumber: true })}
              />
              <span className="w-10 text-right text-xs text-slate-400 font-mono">
                {form.watch("interest_rate")?.toFixed(1)}%
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold rounded-lg h-10 mt-3 text-sm transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-[1.02] cursor-pointer"
              disabled={createAdvisory.isPending || optionsLoading}
            >
              {createAdvisory.isPending ? "Calculating..." : "Calculate Farm Advisory"}
            </Button>
          </form>
        </div>

        {/* Advisory Output */}
        <div className="flex-1">
          {res ? (
            <div className="bg-[#171B22] border border-[#232936] rounded-xl shadow-xl overflow-hidden text-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                  🌱 {res.farmer.name || "Farmer"} – Soybean Advisory Report
                </h2>
                <p className="text-xs text-slate-400 mb-6 pb-4 border-b border-[#232936]">
                  {res.farmer.taluka}, Sangli • {res.farmer.soil} soil • {res.farmer.acres} acres • {res.farmer.variety}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#101912] p-4 rounded-xl border border-[#22C55E]/30">
                    <div className="flex items-center gap-2 text-xs text-[#4ADE80] font-semibold mb-2">
                      <Calendar className="w-4 h-4" /> Harvest Window
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{res.harvest.expected_date}</div>
                    <div className="text-xs text-slate-400">
                      Window: {res.harvest.window[0]} → {res.harvest.window[1]}
                    </div>
                    <div className="text-xs font-medium text-[#4ADE80] mt-1">
                      {res.harvest.days_to_harvest > 0
                        ? `(in ${res.harvest.days_to_harvest} days)`
                        : `(${Math.abs(res.harvest.days_to_harvest)} days ago)`}
                    </div>
                  </div>

                  <div className="bg-[#101725] p-4 rounded-xl border border-sky-500/30">
                    <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-2">
                      <Leaf className="w-4 h-4" /> Current Crop Stage
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 capitalize">{res.harvest.crop_stage}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {res.harvest.days_after_sowing} days after sowing ({new Date(res.farmer.sowing_date).toISOString().split('T')[0]})
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-300 mb-6 bg-[#0E1116] p-3.5 rounded-lg border border-[#232936]">
                  <strong className="text-white">Agronomic Stage Tip:</strong> {res.harvest.stage_tip}
                </div>

                <div className="bg-[#241315] border border-red-900/50 p-4 rounded-xl mb-4 text-sm relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl"></div>
                  <div className="flex items-start gap-2 mb-1">
                    <span>💰</span>
                    <div>
                      <span className="font-semibold text-slate-200">Selling Strategy: </span>
                      <span className="text-red-400 font-bold uppercase">{res.advisory.decision} (in phases)</span>
                      <span className="text-slate-400"> (target: {res.advisory.sell_when}) – est. ₹{res.advisory.expected_net_price}/q</span>
                    </div>
                  </div>
                  <div className="ml-7 text-slate-300 mb-1">{res.advisory.reason}</div>
                  <div className="ml-7 text-[#4ADE80] text-xs mb-1">मराठी: {res.advisory.reason_marathi}</div>
                  <div className="ml-7 text-slate-500 text-xs">Mandi benchmark: ₹{res.market.analysis.price_now}/q as of {res.market.analysis.as_of.split('T')[0]}</div>
                </div>

                <div className="text-sm text-slate-300 mb-4 flex items-start gap-2">
                  <span>📈</span>
                  <div>
                    <span className="font-medium text-slate-200">Yield outlook:</span> {res.yield_outlook.kg_per_ha.expected.toFixed(0)} kg/ha
                    (range {res.yield_outlook.kg_per_ha.low.toFixed(0)} – {res.yield_outlook.kg_per_ha.high.toFixed(0)}) → 
                    <span className="font-bold text-[#4ADE80]"> {res.yield_outlook.production_quintals.expected.toFixed(0)} quintals </span> 
                    ({res.yield_outlook.production_quintals.low.toFixed(0)}–{res.yield_outlook.production_quintals.high.toFixed(0)}) – 
                    est. revenue {formatCurrency(res.advisory.revenue_inr.expected)}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 font-medium text-white mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Agronomic Alerts
                  </div>
                  <ul className="space-y-1 text-sm pl-6 list-disc text-slate-400">
                    {res.alerts?.map((alert: string, i: number) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[420px] border border-[#232936] rounded-xl border-dashed flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-[#171B22]/50">
              <Leaf className="w-12 h-12 mb-4 text-[#22C55E]/40" />
              <p className="text-lg font-semibold text-white mb-2">Ready to calculate your advisory</p>
              <p className="text-sm max-w-sm text-slate-400">
                Fill out the farm parameters on the left to receive customized harvest predictions, yield forecasts, and Sangli mandi storage guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
