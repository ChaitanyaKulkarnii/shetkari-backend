import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackFormValues } from "../lib/validation";
import { useOptions, useSubmitFeedback } from "../api/queries";
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertTitle, AlertDescription, Skeleton, cn } from "../components/ui";
import { CheckCircle2 } from "lucide-react";

export default function Feedback() {
  const { t } = useTranslation();
  const { data: options, isLoading: optionsLoading } = useOptions();
  const submitFeedback = useSubmitFeedback();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      taluka: "",
      variety: "",
      sowing_date: "",
      harvest_date: "",
    },
  });

  useEffect(() => {
    // Try to pre-fill from recent advisory
    const saved = sessionStorage.getItem("advisoryResult");
    if (saved) {
      try {
        const { req } = JSON.parse(saved);
        if (req.taluka) form.setValue("taluka", req.taluka);
        if (req.variety) form.setValue("variety", req.variety);
        if (req.sowing_date) form.setValue("sowing_date", req.sowing_date);
      } catch (e) {}
    }
  }, [form]);

  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedback.mutate(data, {
      onError: (err: any) => {
        if (err.status === 422 && Array.isArray(err.detail)) {
          err.detail.forEach((issue: any) => {
            const field = issue.loc[issue.loc.length - 1];
            form.setError(field as any, { message: issue.msg });
          });
        }
      },
    });
  };

  if (submitFeedback.isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 animate-in zoom-in duration-500 mt-12">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
        <p className="text-lg text-slate-600">{t("feedback.success")}</p>
        <Button onClick={() => submitFeedback.reset()} variant="outline" className="mt-4">
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("feedback.title")}</h1>
        <p className="text-slate-500">{t("feedback.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("feedback.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {submitFeedback.isError && (submitFeedback.error as any).status !== 422 && (
              <Alert variant="destructive">
                <AlertTitle>{(submitFeedback.error as any).error || "Error"}</AlertTitle>
                <AlertDescription>{(submitFeedback.error as any).detail as string}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t("form.taluka")}</label>
                {optionsLoading ? <Skeleton className="h-11 w-full" /> : (
                  <select
                    className={cn(
                      "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      form.formState.errors.taluka && "border-red-500 focus-visible:ring-red-500"
                    )}
                    {...form.register("taluka")}
                  >
                    <option value="">{t("form.select", { item: t("form.taluka") })}</option>
                    {options?.talukas?.map((t: string) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
                {form.formState.errors.taluka && (
                  <p className="text-sm text-red-500">{form.formState.errors.taluka.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t("form.variety")}</label>
                {optionsLoading ? <Skeleton className="h-11 w-full" /> : (
                  <select
                    className={cn(
                      "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      form.formState.errors.variety && "border-red-500 focus-visible:ring-red-500"
                    )}
                    {...form.register("variety")}
                  >
                    <option value="">{t("form.select", { item: t("form.variety") })}</option>
                    {Object.entries(options?.varieties || {}).map(([v, label]) => (
                      <option key={v} value={v}>{label as string}</option>
                    ))}
                  </select>
                )}
                {form.formState.errors.variety && (
                  <p className="text-sm text-red-500">{form.formState.errors.variety.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t("form.sowing_date")}</label>
                <input
                  type="date"
                  className={cn(
                    "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    form.formState.errors.sowing_date && "border-red-500 focus-visible:ring-red-500"
                  )}
                  {...form.register("sowing_date")}
                />
                {form.formState.errors.sowing_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.sowing_date.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t("feedback.harvest_date")}</label>
                <input
                  type="date"
                  className={cn(
                    "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    form.formState.errors.harvest_date && "border-red-500 focus-visible:ring-red-500"
                  )}
                  {...form.register("harvest_date")}
                />
                {form.formState.errors.harvest_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.harvest_date.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={submitFeedback.isPending || optionsLoading}>
              {submitFeedback.isPending ? t("form.loading") : t("feedback.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
