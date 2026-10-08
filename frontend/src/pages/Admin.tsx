import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRetrainModel } from "../api/queries";
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertTitle, AlertDescription } from "../components/ui";

export default function Admin() {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const retrain = useRetrainModel();

  const handleRetrain = () => {
    if (!apiKey) return;
    if (window.confirm(t("admin.confirm"))) {
      retrain.mutate(apiKey);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("admin.api_key")}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Enter admin API key"
            />
          </div>
          
          {retrain.isError && (
            <Alert variant="destructive">
              <AlertTitle>{(retrain.error as any).error || "Error"}</AlertTitle>
              <AlertDescription>{(retrain.error as any).detail as string}</AlertDescription>
            </Alert>
          )}

          {retrain.isSuccess && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {t("admin.success", { count: retrain.data.n_obs })}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleRetrain} 
            className="w-full" 
            disabled={!apiKey || retrain.isPending}
            variant="destructive"
          >
            {retrain.isPending ? "Processing..." : t("admin.retrain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
