import { useTranslation } from "react-i18next";
import { useModelCard, useHealth } from "../api/queries";
import { Card, CardContent, CardHeader, CardTitle, Alert, AlertTitle, Button, Skeleton } from "../components/ui";

export default function About() {
  const { t } = useTranslation();
  const { data: modelCard, isLoading, isError, refetch } = useModelCard();
  const { data: health } = useHealth();

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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{t("about.title")}</h1>
        <div className="flex gap-4 text-sm text-slate-500">
          <span>{t("about.version")}: <span className="font-medium text-slate-900">{health?.model_version || "..."}</span></span>
          <span>{t("about.trained")}: <span className="font-medium text-slate-900">{health?.trained_at ? new Date(health.trained_at).toLocaleDateString() : "..."}</span></span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("about.how_it_works")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-slate-600">
              {modelCard?.how_it_works?.map((p: string, i: number) => (
                <p key={i} className="mb-4 leading-relaxed">{p}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("about.assumptions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ul className="space-y-2 list-disc pl-5 text-slate-600">
              {modelCard?.assumptions?.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation & Limitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-500">MAE</p>
                  <p className="font-medium">{modelCard?.evaluation?.harvest_model_mae_days?.toFixed(1) ?? "-"} days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">RMSE</p>
                  <p className="font-medium">{modelCard?.evaluation?.harvest_model_rmse_days?.toFixed(1) ?? "-"} days</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Yield Err</p>
                  <p className="font-medium">{modelCard?.evaluation?.yield_model_error_margin}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Limitations</h4>
                <ul className="space-y-2 list-disc pl-5 text-slate-600">
                  {modelCard?.limitations?.map((l: string, i: number) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
