import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advisorySchema, type AdvisoryFormValues } from "../lib/validation";
import { useOptions, useCreateAdvisory } from "../api/queries";
import { Button, Alert, AlertTitle, AlertDescription, Skeleton, cn } from "../components/ui";
import { formatCurrency } from "../lib/format";
import { Calendar, Leaf, AlertTriangle } from "lucide-react";

export default function Home() {
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
      interest_rate: 1, // Will map to 0.01
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
      <Alert variant="destructive">
        <AlertTitle>Server is not reachable</AlertTitle>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </Alert>
    );
  }

  const res = createAdvisory.data;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar Form */}
      <div className="w-full lg:w-1/3 xl:w-1/4 shrink-0 space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg border shadow-sm text-sm">
          {createAdvisory.isError && (createAdvisory.error as any).status !== 422 && (
            <Alert variant="destructive" className="p-3">
              <AlertTitle className="text-sm">{(createAdvisory.error as any).error || "Error"}</AlertTitle>
              <AlertDescription className="text-xs">{(createAdvisory.error as any).detail as string}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0">Name</label>
            <input
              type="text"
              placeholder="Raju"
              className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none", form.formState.errors.name && "border-red-500")}
              {...form.register("name")}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0">Taluka</label>
            {optionsLoading ? <Skeleton className="flex-1 h-8" /> : (
              <select
                className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none bg-white", form.formState.errors.taluka && "border-red-500")}
                {...form.register("taluka")}
              >
                <option value="">Select</option>
                {options?.talukas?.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0">Crop</label>
            {optionsLoading ? <Skeleton className="flex-1 h-8" /> : (
              <select
                className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none bg-slate-50", form.formState.errors.crop && "border-red-500")}
                {...form.register("crop")}
              >
                <option value="">Select</option>
                {options?.crops?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0 truncate">Sowing d...</label>
            <input
              type="date"
              className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none", form.formState.errors.sowing_date && "border-red-500")}
              {...form.register("sowing_date")}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0">Soil</label>
            {optionsLoading ? <Skeleton className="flex-1 h-8" /> : (
              <select
                className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none bg-white", form.formState.errors.soil && "border-red-500")}
                {...form.register("soil")}
              >
                <option value="">Select</option>
                {options?.soils?.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0">Variety</label>
            {optionsLoading ? <Skeleton className="flex-1 h-8" /> : (
              <select
                className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none bg-white", form.formState.errors.variety && "border-red-500")}
                {...form.register("variety")}
              >
                <option value="">Select</option>
                {Object.entries(options?.varieties || {}).map(([v, label]) => (
                  <option key={v} value={v}>{label as string}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 pb-2 border-b">
            <label className="font-semibold w-20 shrink-0">Acres</label>
            <input
              type="number"
              step="0.1"
              placeholder="5"
              className={cn("flex-1 h-8 rounded border px-2 focus:ring-1 focus:ring-slate-900 outline-none", form.formState.errors.acres && "border-red-500")}
              {...form.register("acres", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="font-semibold w-20 shrink-0 truncate">Storage ₹/q...</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              className="flex-1 accent-slate-800"
              {...form.register("storage_cost", { valueAsNumber: true })}
            />
            <span className="w-10 text-right text-xs text-slate-500">{form.watch("storage_cost")?.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold w-20 shrink-0 truncate">Interest %/mo</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              className="flex-1 accent-slate-800"
              {...form.register("interest_rate", { valueAsNumber: true })}
            />
            <span className="w-10 text-right text-xs text-slate-500">{form.watch("interest_rate")?.toFixed(2)}</span>
          </div>

          <Button type="submit" className="w-auto bg-[#1C1E21] hover:bg-[#2F3237] text-white rounded-full px-6 py-2 h-10 mt-4 text-sm font-semibold" disabled={createAdvisory.isPending || optionsLoading}>
            {createAdvisory.isPending ? "Loading..." : "Get my advi..."}
          </Button>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {res ? (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
                🌱 {res.farmer.name || "Farmer"} – Soybean advisory
              </h1>
              <p className="text-xs text-slate-500 mb-6 pb-4 border-b">
                {res.farmer.taluka}, Sangli • {res.farmer.soil} soil • {res.farmer.acres} acres • {res.farmer.variety}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F3F6EB] p-4 rounded-lg border border-[#E1EAD2]">
                  <div className="flex items-center gap-2 text-sm text-[#506B26] font-medium mb-2">
                    <Calendar className="w-4 h-4" /> Harvest
                  </div>
                  <div className="text-xl font-bold text-slate-900 mb-1">{res.harvest.expected_date}</div>
                  <div className="text-xs text-slate-600">
                    window {res.harvest.window[0]} → {res.harvest.window[1]}
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-1">
                    {res.harvest.days_to_harvest > 0 
                      ? `(in ${res.harvest.days_to_harvest} days)` 
                      : `(${Math.abs(res.harvest.days_to_harvest)} days ago)`}
                  </div>
                </div>

                <div className="bg-[#EBF4FA] p-4 rounded-lg border border-[#D0E5F5]">
                  <div className="flex items-center gap-2 text-sm text-[#276495] font-medium mb-2">
                    <Leaf className="w-4 h-4" /> Crop stage today
                  </div>
                  <div className="text-xl font-bold text-slate-900 mb-1 capitalize">{res.harvest.crop_stage}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {res.harvest.days_after_sowing} days after sowing ({new Date(res.farmer.sowing_date).toISOString().split('T')[0]})
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-800 mb-6">
                What to do now: {res.harvest.stage_tip}
              </div>

              <div className="bg-[#FAF7F7] border border-red-100 p-4 rounded-lg mb-4 text-sm relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg"></div>
                <div className="flex items-start gap-2 mb-1">
                  <span>💰</span>
                  <div>
                    <span className="font-semibold">Selling advice: </span>
                    <span className="text-red-600 font-bold uppercase">{res.advisory.decision} (in phases)</span>
                    <span className="text-slate-600"> (target: {res.advisory.sell_when}) – expected ₹{res.advisory.expected_net_price}/quintal</span>
                  </div>
                </div>
                <div className="ml-7 text-slate-700 mb-1">{res.advisory.reason}</div>
                <div className="ml-7 text-slate-600 mb-1">मराठी: {res.advisory.reason_marathi}</div>
                <div className="ml-7 text-slate-500 text-xs">Price used: ₹{res.market.analysis.price_now}/q as of {res.market.analysis.as_of.split('T')[0]}</div>
              </div>

              <div className="text-sm text-slate-800 mb-4 flex items-start gap-2">
                <span>📈</span>
                <div>
                  <span className="font-medium">Yield outlook:</span> {res.yield_outlook.kg_per_ha.expected.toFixed(0)} kg/ha 
                  (range {res.yield_outlook.kg_per_ha.low.toFixed(0)} – {res.yield_outlook.kg_per_ha.high.toFixed(0)}) → 
                  <span className="font-semibold"> {res.yield_outlook.production_quintals.expected.toFixed(0)} quintals </span> 
                  ({res.yield_outlook.production_quintals.low.toFixed(0)}–{res.yield_outlook.production_quintals.high.toFixed(0)}) – 
                  est. revenue {formatCurrency(res.advisory.revenue_inr.expected)} 
                  ({formatCurrency(res.advisory.revenue_inr.low)} – {formatCurrency(res.advisory.revenue_inr.high)})
                </div>
              </div>

              <div className="text-sm text-slate-800 mb-6 flex items-start gap-2">
                <span>🪄</span>
                <div>
                  <span className="font-medium">Soil:</span> {res.soil.note}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 font-medium text-slate-900 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerts
                </div>
                <ul className="space-y-1.5 text-sm pl-6 list-disc text-slate-700">
                  {res.alerts?.map((alert: string, i: number) => {
                    let prefix = "";
                    if (alert.includes("dry spell")) prefix = "⚠️ ";
                    else if (alert.includes("Sowing is within")) prefix = "✅ ";
                    return <li key={i}>{prefix}{alert.replace(/^[⚠️✅]\s*/, '')}</li>;
                  })}
                  {res.crop_health?.message && (
                    <li>{res.crop_health.message.replace(/Healthy/, '✅ Healthy').replace(/Stress/, '⚠️ Stress')}</li>
                  )}
                </ul>
              </div>

              {res.market.harvest_time_plan?.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                      <tr>
                        <th className="px-4 py-2">Sell in</th>
                        <th className="px-4 py-2 text-right">Net ₹/quintal</th>
                        <th className="px-4 py-2 text-right">vs harvest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {res.market.harvest_time_plan.map((row: any, i: number) => {
                        const basePrice = res.market.harvest_time_plan[0].net_price;
                        const pctChange = ((row.net_price / basePrice - 1) * 100);
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="px-4 py-2">{row.sell_month}</td>
                            <td className="px-4 py-2 text-right">₹{row.net_price.toFixed(0)}</td>
                            <td className="px-4 py-2 text-right">
                              {pctChange > 0 ? "+" : ""}{pctChange.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 border-t text-[10px] text-slate-500 leading-relaxed">
              {res.disclaimer}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] border rounded-lg border-dashed flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
            <Leaf className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600 mb-2">Fill the form to get your advisory</p>
            <p className="text-sm max-w-sm">Enter your farm details on the left to receive a customized harvest, yield, and market plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
