import { useTranslation } from "react-i18next";
import { useMarketReport } from "../api/queries";
import { Card, CardContent, CardHeader, CardTitle, Alert, AlertTitle, Button, Skeleton } from "../components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../lib/format";
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";
import { cn } from "../components/ui";

export default function Market() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch, isFetching } = useMarketReport();
  const locale = i18n.language === "mr" ? "mr-IN" : i18n.language === "hi" ? "hi-IN" : "en-IN";

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t("error.server_unreachable")}</AlertTitle>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          {t("error.retry")}
        </Button>
      </Alert>
    );
  }

  const chartData = data?.storage_plan?.map((plan: any) => ({
    name: plan.month,
    revenue: plan.net_revenue,
    cost: plan.total_cost,
    price: plan.expected_price,
  }));

  const bestMonth = data?.storage_plan?.reduce((max: any, current: any) =>
    current.net_revenue > max.net_revenue ? current : max
  , data?.storage_plan[0]);

  const MomentumIcon = data?.momentum === "UP" ? ArrowUpCircle : data?.momentum === "DOWN" ? ArrowDownCircle : MinusCircle;
  const momentumColor = data?.momentum === "UP" ? "text-green-500" : data?.momentum === "DOWN" ? "text-red-500" : "text-amber-500";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("market.title")}</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-500 mb-1">{t("result.market.price")}</p>
            {isLoading ? <Skeleton className="h-8 w-32 mx-auto" /> : (
              <p className="text-3xl font-bold">{formatCurrency(data?.current_price_inr, locale)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-500 mb-1">{t("result.market.momentum")}</p>
            {isLoading ? <Skeleton className="h-8 w-32 mx-auto" /> : (
              <p className="text-2xl font-medium flex items-center justify-center gap-2">
                {data?.momentum} <MomentumIcon className={cn("w-6 h-6", momentumColor)} />
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-500 mb-1">{t("result.market.seasonality")}</p>
            {isLoading ? <Skeleton className="h-8 w-full" /> : (
              <p className="text-base font-medium">{data?.seasonality_insight}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{t("market.storage_plan")}</span>
            {bestMonth && (
              <span className="text-sm font-normal bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {t("market.best_month")}: <span className="font-bold">{bestMonth.month}</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <RechartsTooltip
                      formatter={(value: any) => formatCurrency(value, locale)}
                      labelStyle={{ color: '#333', fontWeight: 'bold' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name={t("market.revenue")}
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                    <tr>
                      <th className="px-4 py-3">{t("market.month")}</th>
                      <th className="px-4 py-3 text-right">{t("result.market.price")}</th>
                      <th className="px-4 py-3 text-right">{t("market.storage_cost")}</th>
                      <th className="px-4 py-3 text-right font-bold text-green-700">{t("market.net_price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.storage_plan?.map((plan: any) => (
                      <tr key={plan.month} className={cn("border-b", plan.month === bestMonth?.month ? "bg-green-50" : "bg-white")}>
                        <td className="px-4 py-3 font-medium">{plan.month}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(plan.expected_price, locale)}</td>
                        <td className="px-4 py-3 text-right text-red-500">-{formatCurrency(plan.total_cost, locale)}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(plan.net_revenue, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
