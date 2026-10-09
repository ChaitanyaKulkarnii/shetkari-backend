import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getHealth, 
  getOptions, 
  getModelCard, 
  getMarketReport, 
  createAdvisory, 
  submitHarvestFeedback 
} from "../api/endpoints";
import { transformAdvisoryData } from "../data";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("farmerProfile");
    return saved ? JSON.parse(saved) : { name: "Ramesh Patil", mobile: "9876543210", location: "Miraj, Sangli" };
  });

  const [options, setOptions] = useState({
    talukas: [
      "Atpadi", "Jath", "Kadegaon", "Kavathe Mahankal", "Khanapur",
      "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"
    ],
    crops: ["Soybean"],
    soils: [
      "Deep black (heavy)", "Medium black", "Alluvial / sandy loam", 
      "Shallow / murum", "Red / laterite"
    ],
    varieties: {
      "early": "Early (~90 days)",
      "medium": "Medium (~100 days)",
      "late": "Late (~110 days)"
    }
  });

  const [health, setHealth] = useState(null);
  const [modelCard, setModelCard] = useState(null);
  const [marketReport, setMarketReport] = useState(null);
  const [rawAdvisory, setRawAdvisory] = useState(null);
  const [uiData, setUiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('krishilens_lang') || 'en';
  });

  // Initial load: fetch options, health, market & trigger baseline advisory
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const [optRes, healthRes, marketRes, cardRes] = await Promise.allSettled([
          getOptions(),
          getHealth(),
          getMarketReport(),
          getModelCard()
        ]);

        if (!mounted) return;

        if (optRes.status === "fulfilled" && optRes.value) {
          setOptions(optRes.value);
        }
        if (healthRes.status === "fulfilled" && healthRes.value) {
          setHealth(healthRes.value);
        }
        if (marketRes.status === "fulfilled" && marketRes.value) {
          setMarketReport(marketRes.value);
        }
        if (cardRes.status === "fulfilled" && cardRes.value) {
          setModelCard(cardRes.value);
        }

        // Parse taluka from profile location
        const profileTaluka = profile?.location ? profile.location.split(',')[0].trim() : "Miraj";

        // Run default baseline advisory for Sangli
        const defaultReq = {
          name: profile?.name || "Ramesh Patil",
          taluka: profileTaluka,
          crop: "Soybean",
          sowing_date: "2026-06-20",
          soil: "Medium black",
          variety: "medium",
          acres: 5,
          storage_cost: 15,
          interest_rate: 0.01
        };

        const advRes = await createAdvisory(defaultReq);
        if (mounted && advRes) {
          setRawAdvisory(advRes);
          setUiData(transformAdvisoryData(advRes));
        }
      } catch (err) {
        console.warn("Backend initialization notice:", err);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  const runAdvisory = async (formValues) => {
    setLoading(true);
    setError(null);
    try {
      const rawReq = uiData?.raw?.request || {};
      
      const parsedAcres = Number(formValues.acres) || Number((formValues.area || '').toString().split(' ')[0]) || Number(rawReq.acres) || 5;
      const parsedStorageCost = formValues.storage_cost !== undefined ? Number(formValues.storage_cost) : (rawReq.storage_cost ?? 15);
      
      let parsedInterest = formValues.interest_rate !== undefined ? Number(formValues.interest_rate) : (rawReq.interest_rate ?? 0.01);
      if (parsedInterest > 0.1 && parsedInterest >= 1) { // Convert percentage (e.g. 1.0) to decimal (0.01)
        parsedInterest = parsedInterest / 100;
      }

      const payload = {
        name: formValues.name || profile.name || rawReq.name || "Farmer",
        taluka: formValues.taluka || rawReq.taluka || "Miraj",
        crop: formValues.crop || rawReq.crop || "Soybean",
        sowing_date: formValues.sowing_date || formValues.sowingDate || rawReq.sowing_date || "2026-06-20",
        soil: formValues.soil || rawReq.soil || "Medium black",
        variety: formValues.variety || rawReq.variety || "medium",
        acres: parsedAcres,
        storage_cost: parsedStorageCost,
        interest_rate: parsedInterest
      };

      const res = await createAdvisory(payload);
      setRawAdvisory(res);
      const transformed = transformAdvisoryData(res);
      setUiData(transformed);
      localStorage.setItem("farmerAdvisory", JSON.stringify(res));
      setLoading(false);
      return transformed;
    } catch (err) {
      console.error("Advisory calculation error:", err);
      setError(err?.detail || err?.message || "Failed to calculate advisory");
      setLoading(false);
      throw err;
    }
  };

  const reportHarvest = async (data) => {
    try {
      const payload = {
        sowing_date: data.sowing_date || "2026-06-20",
        harvest_date: data.harvest_date,
        variety: data.variety || "medium",
        taluka: data.taluka || "Miraj"
      };
      const res = await submitHarvestFeedback(payload);
      return res;
    } catch (err) {
      console.error("Harvest feedback error:", err);
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        options,
        health,
        modelCard,
        marketReport,
        rawAdvisory,
        uiData,
        loading,
        error,
        language,
        setLanguage: (lang) => {
          localStorage.setItem('krishilens_lang', lang);
          setLanguage(lang);
        },
        runAdvisory,
        reportHarvest
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
