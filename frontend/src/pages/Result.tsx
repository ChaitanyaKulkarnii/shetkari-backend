import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, Button, cn } from "../components/ui";
import { formatCurrency, formatDate } from "../lib/format";
import { Share2, ArrowUpCircle, ArrowDownCircle, MinusCircle, Printer, ArrowLeft } from "lucide-react";

export default function Result() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("advisoryResult");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {}
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!data) return null;

  const { res, req } = data;
  const decision = res.advisory?.decision || "HOLD";
  const revenue = res.advisory?.expected_revenue_inr || 0;
  const isSell = decision === "SELL AT HARVEST";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("app.title"),
          text: `My Soybean Advisory: ${decision}. Expected Revenue: ${formatCurrency(revenue, i18n.language === "mr" ? "mr-IN" : i18n.language === "hi" ? "hi-IN" : "en-IN")}`,
          url: window.location.origin,
        });
      } catch (err) {}
    }
  };

  const MomentumIcon = res.market?.momentum === "UP" ? ArrowUpCircle : res.market?.momentum === "DOWN" ? ArrowDownCircle : MinusCircle;
  const momentumColor = res.market?.momentum === "UP" ? "text-green-500" : res.market?.momentum === "DOWN" ? "text-red-500" : "text-amber-500";

  const locale = i18n.language === "mr" ? "mr-IN" : i18n.language === "hi" ? "hi-IN" : "en-IN";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {t("result.actions.new")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => window.print()} title="Print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare} title="Share">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={cn(
        "rounded-xl p-6 text-center shadow-lg border-2",
        isSell ? "bg-green-50 border-green-200 text-green-900" : "bg-amber-50 border-amber-200 text-amber-900"
      )}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">{t("result.decision.title")}</h2>
        <div className="text-4xl md:text-5xl font-extrabold mb-4">
          {isSell ? t("result.decision.sell") : t("result.decision.hold")}
        </div>
        <div className="text-2xl font-semibold mb-4">
          {t("result.decision.revenue", { amount: formatCurrency(revenue, locale) })}
        </div>
        <p className="text-lg opacity-90 max-w-lg mx-auto">
          {isSell ? t("result.decision.explanation_sell") : t("result.decision.explanation_hold")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("result.harvest.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">{t("result.harvest.expected_date")}</p>
              <p className="text-xl font-medium">{formatDate(res.harvest?.expected_harvest_date, locale)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t("result.harvest.days_to_harvest")}</p>
              <p className="text-xl font-medium text-blue-600">{res.harvest?.days_to_harvest} days</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">{t("result.harvest.stage")}</p>
              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (1 - res.harvest?.days_to_harvest / 120) * 100))}%` }}></div>
              </div>
              <p className="text-sm font-medium capitalize">{res.harvest?.crop_stage}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("result.yield.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end border-b pb-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">{t("result.yield.low")}</p>
                <p className="text-lg font-medium text-amber-600">{res.yield?.low_quintals?.toFixed(1) ?? "-"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">{t("result.yield.expected")}</p>
                <p className="text-3xl font-bold text-green-700">{res.yield?.expected_quintals?.toFixed(1) ?? "-"}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">{t("result.yield.high")}</p>
                <p className="text-lg font-medium text-blue-600">{res.yield?.high_quintals?.toFixed(1) ?? "-"}</p>
              </div>
            </div>
            <div className="pt-2 text-center text-sm text-slate-600">
              <p>{t("result.yield.total", { acres: req.acres })}</p>
              <p>{t("result.yield.per_acre", { amount: ((res.yield?.expected_quintals || 0) / req.acres).toFixed(1) })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("result.market.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-500 mb-1">{t("result.market.price")}</p>
                <p className="text-2xl font-bold">{formatCurrency(res.market?.current_price_inr, locale)} / q</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t("result.market.momentum")}</p>
                <p className="text-xl font-medium flex items-center justify-center gap-2">
                  {res.market?.momentum} <MomentumIcon className={cn("w-5 h-5", momentumColor)} />
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">{t("result.market.seasonality")}</p>
                <p className="text-sm font-medium px-4">{res.market?.seasonality_insight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 print:hidden">
        <Button onClick={() => navigate("/feedback")} variant="outline" className="w-full sm:w-auto">
          {t("result.actions.report")}
        </Button>
      </div>
    </div>
  );
}
