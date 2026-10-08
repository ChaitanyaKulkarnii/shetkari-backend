import React, { useState, useEffect } from "react";
import {
  Sprout,
  ArrowLeft,
  Calendar,
  Layers3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  DollarSign,
  Activity,
  Droplets
} from "lucide-react";

import { createAdvisory, getOptions } from "../api/endpoints";

const DEFAULT_FORM = {
  name: "Raju",
  taluka: "Miraj",
  crop: "Soybean",
  sowing_date: "2026-06-01",
  soil: "Deep black (heavy)",
  variety: "early",
  acres: "1",
  storage_cost: 7.0,
  interest_percent: 0.50
};

const TALUKA_OPTIONS = [
  "Atpadi",
  "Jath",
  "Kadegaon",
  "Kavathe Mahankal",
  "Khanapur",
  "Miraj",
  "Palus",
  "Shirala",
  "Tasgaon",
  "Walwa"
];

const SOIL_OPTIONS = [
  "Deep black (heavy)",
  "Medium black",
  "Alluvial / sandy loam",
  "Shallow / murum",
  "Red / laterite"
];

const VARIETY_OPTIONS = [
  { value: "early", label: "Early (~90 days)" },
  { value: "medium", label: "Medium (~100 days)" },
  { value: "late", label: "Late (~110 days)" }
];

export default function CropAdvisoryPage({ onHome, onWorkspace }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Dynamic status messages during advisory generation
  const loadingMessages = [
    "Reading crop conditions & soil profile...",
    "Analyzing phenological stage & weather patterns...",
    "Evaluating Sangli APMC market trends...",
    "Finalizing personalized harvest & selling plan..."
  ];

  // Auto-fetch baseline advisory on initial mount
  useEffect(() => {
    executeAdvisory(DEFAULT_FORM);
  }, []);

  // Cycle loading messages when loading is active
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Farmer name is required.";
    }
    if (!formData.taluka) {
      errs.taluka = "Taluka selection is required.";
    }
    if (!formData.crop) {
      errs.crop = "Crop selection is required.";
    }
    if (!formData.sowing_date) {
      errs.sowing_date = "Sowing date is required.";
    } else {
      const d = new Date(formData.sowing_date);
      if (isNaN(d.getTime())) {
        errs.sowing_date = "Invalid date format.";
      }
    }
    if (!formData.soil) {
      errs.soil = "Soil type is required.";
    }
    if (!formData.variety) {
      errs.variety = "Variety selection is required.";
    }
    const acresNum = parseFloat(formData.acres);
    if (isNaN(acresNum) || acresNum <= 0) {
      errs.acres = "Acres must be a positive number greater than 0.";
    }
    if (formData.storage_cost < 0) {
      errs.storage_cost = "Storage cost cannot be negative.";
    }
    if (formData.interest_percent < 0 || formData.interest_percent > 10) {
      errs.interest_percent = "Interest must be between 0% and 10% per month.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const executeAdvisory = async (dataToSubmit) => {
    setLoading(true);
    setApiError(null);

    try {
      // Backend expects interest_rate in decimal (0.005 for 0.5%)
      const interestRateDecimal = parseFloat(dataToSubmit.interest_percent) / 100;
      
      const payload = {
        name: dataToSubmit.name.trim(),
        taluka: dataToSubmit.taluka,
        crop: dataToSubmit.crop,
        sowing_date: dataToSubmit.sowing_date,
        soil: dataToSubmit.soil,
        variety: dataToSubmit.variety,
        acres: parseFloat(dataToSubmit.acres),
        storage_cost: parseFloat(dataToSubmit.storage_cost),
        interest_rate: interestRateDecimal
      };

      const res = await createAdvisory(payload);
      setResult(res);
    } catch (err) {
      console.error("Advisory error:", err);
      const msg =
        err?.detail ||
        (Array.isArray(err?.detail) ? err.detail.join(", ") : null) ||
        err?.message ||
        "Failed to generate crop advisory from model.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    executeAdvisory(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] text-[#1F2420] flex flex-col font-sans">
      {/* ================================================== */}
      {/* TOP HEADER */}
      {/* ================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onHome}
              className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#5E645C] hover:text-[#1F2420] transition-colors cursor-pointer mr-1"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              onClick={onHome}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#426039] text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-[#1F2420] leading-none tracking-tight">
                  Krishi<span className="font-medium text-[#5E645C]">Lens</span>
                </span>
                <small className="text-[10px] text-[#5E645C] font-medium leading-tight mt-0.5">
                  Sangli Soybean Advisory
                </small>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF4EC] border border-[#E4E8E1] text-[#426039] text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#426039] animate-pulse"></span>
              <span>Model v0.2.0 · Live Backend</span>
            </div>

            {onWorkspace && (
              <button
                onClick={onWorkspace}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E8E1] hover:bg-[#EFF4EC] text-[#1F2420] text-xs font-semibold transition-all cursor-pointer"
              >
                <Layers3 className="w-3.5 h-3.5 text-[#426039]" />
                <span>Workspace View</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN CONTAINER */}
      {/* ================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#5E645C] mb-1">
            <button onClick={onHome} className="hover:text-[#426039] cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#1F2420] font-medium">Crop Advisory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2420] tracking-tight">
            Soybean Field Advisory & Decision Support
          </h1>
          <p className="text-sm text-[#5E645C] mt-1 max-w-2xl">
            Enter your field specifications to compute calibrated harvest dates, stage-specific actions, and net mandi storage timing for Sangli district.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================== */}
          {/* LEFT COLUMN: CROP INPUT FORM (~38%) */}
          {/* ================================================== */}
          <div className="lg:col-span-5 bg-white border border-[#E4E8E1] rounded-[18px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E8E1] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#EFF4EC] text-[#426039] flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#1F2420]">
                  Tell Us About Your Crop
                </h2>
              </div>
              <span className="text-[11px] font-medium text-[#5E645C] bg-[#F5F5F0] px-2 py-0.5 rounded">
                Sangli Kharif
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Farmer Name */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Raju"
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.name ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-[#FFFFFF] transition-all`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Taluka */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Taluka <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.taluka}
                  onChange={(e) => handleChange("taluka", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.taluka ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-white transition-all`}
                >
                  {TALUKA_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.taluka && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.taluka}</p>
                )}
              </div>

              {/* Crop (Soybean) */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Crop <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.crop}
                  onChange={(e) => handleChange("crop", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E4E8E1] focus:outline-none focus:border-[#426039] bg-white transition-all cursor-default"
                >
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                </select>
              </div>

              {/* Sowing Date */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Sowing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.sowing_date}
                  onChange={(e) => handleChange("sowing_date", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.sowing_date ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-white transition-all`}
                />
                {errors.sowing_date && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.sowing_date}</p>
                )}
              </div>

              {/* Soil */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Soil <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.soil}
                  onChange={(e) => handleChange("soil", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.soil ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-white transition-all`}
                >
                  {SOIL_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.soil && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.soil}</p>
                )}
              </div>

              {/* Variety */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Variety <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.variety}
                  onChange={(e) => handleChange("variety", e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.variety ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-white transition-all`}
                >
                  {VARIETY_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
                {errors.variety && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.variety}</p>
                )}
              </div>

              {/* Acres */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2420] mb-1">
                  Acres <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="100"
                  value={formData.acres}
                  onChange={(e) => handleChange("acres", e.target.value)}
                  placeholder="e.g. 1"
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.acres ? "border-red-500 bg-red-50/30" : "border-[#E4E8E1]"
                  } focus:outline-none focus:border-[#426039] focus:ring-1 focus:ring-[#426039] bg-white transition-all`}
                />
                {errors.acres && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.acres}</p>
                )}
              </div>

              {/* Storage ₹/quintal (Slider + number) */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1F2420] mb-1.5">
                  <span className="flex items-center gap-1">
                    Storage ₹/quintal/mo
                    <span className="text-[10px] text-[#5E645C] font-normal">(Warehousing)</span>
                  </span>
                  <span className="font-mono text-[#426039] bg-[#EFF4EC] px-2 py-0.5 rounded text-xs">
                    ₹{Number(formData.storage_cost).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={formData.storage_cost}
                    onChange={(e) => handleChange("storage_cost", parseFloat(e.target.value))}
                    className="flex-1 accent-[#426039] cursor-pointer h-1.5 bg-[#E4E8E1] rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={formData.storage_cost}
                    onChange={(e) => handleChange("storage_cost", parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs text-right border border-[#E4E8E1] rounded focus:outline-none focus:border-[#426039]"
                  />
                </div>
              </div>

              {/* Interest %/month (Slider + number) */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1F2420] mb-1.5">
                  <span className="flex items-center gap-1">
                    Interest %/mo
                    <span className="text-[10px] text-[#5E645C] font-normal">(Opportunity cost)</span>
                  </span>
                  <span className="font-mono text-[#426039] bg-[#EFF4EC] px-2 py-0.5 rounded text-xs">
                    {Number(formData.interest_percent).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="2.5"
                    step="0.05"
                    value={formData.interest_percent}
                    onChange={(e) => handleChange("interest_percent", parseFloat(e.target.value))}
                    className="flex-1 accent-[#426039] cursor-pointer h-1.5 bg-[#E4E8E1] rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={formData.interest_percent}
                    onChange={(e) => handleChange("interest_percent", parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs text-right border border-[#E4E8E1] rounded focus:outline-none focus:border-[#426039]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#426039] hover:bg-[#344d2d] disabled:opacity-70 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Advisory...</span>
                    </>
                  ) : (
                    <>
                      <span>Get My Advisory</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-[#5E645C] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#426039]" />
                  <span>Real Kaggle model calculations · No dummy data</span>
                </p>
              </div>
            </form>
          </div>

          {/* ================================================== */}
          {/* RIGHT COLUMN: ADVISORY RESULTS (~62%) */}
          {/* ================================================== */}
          <div className="lg:col-span-7 space-y-4">

            {/* LOADING STATE CARD */}
            {loading && (
              <div className="bg-white border border-[#E4E8E1] rounded-[18px] p-8 sm:p-10 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#EFF4EC] text-[#426039] flex items-center justify-center mx-auto mb-4 relative">
                  <Sprout className="w-8 h-8 animate-bounce" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#426039] border-t-transparent animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2420] mb-1">
                  Analyzing Your Crop...
                </h3>
                <p className="text-xs sm:text-sm text-[#426039] font-medium transition-all duration-300">
                  {loadingMessages[loadingStep]}
                </p>

                <div className="w-full max-w-xs mx-auto bg-[#F5F5F0] h-1.5 rounded-full overflow-hidden mt-6">
                  <div
                    className="h-full bg-[#426039] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#5E645C] mt-4">
                  Evaluating 10-year Sangli meteorological & APMC price time-series
                </p>
              </div>
            )}

            {/* ERROR STATE CARD */}
            {!loading && apiError && (
              <div className="bg-red-50/50 border border-red-200 rounded-[18px] p-6 text-center shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-red-900 mb-1">
                  Unable to generate your advisory right now
                </h3>
                <p className="text-xs text-red-700 max-w-md mx-auto mb-4">
                  {apiError}
                </p>
                <button
                  onClick={() => executeAdvisory(formData)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* SUCCESS ADVISORY RESULT DISPLAY */}
            {!loading && !apiError && result && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* 1. TOP RESULT CARD */}
                <div className="bg-white border border-[#E4E8E1] rounded-[18px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌱</span>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1F2420] tracking-tight">
                          {result.farmer?.name || "Farmer"} – {result.farmer?.crop || "Soybean"} Advisory
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5E645C] font-medium mt-1">
                        {result.farmer?.taluka}, Sangli · {result.farmer?.soil} soil · {result.farmer?.acres} acre{result.farmer?.acres > 1 ? "s" : ""} · {result.farmer?.variety}
                      </p>
                    </div>

                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF4EC] border border-[#E4E8E1] text-[#426039] text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Calibrated Model</span>
                    </span>
                  </div>
                </div>

                {/* 2. DUAL METRICS: HARVEST & CROP STAGE TODAY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Harvest Card */}
                  <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#5E645C] mb-2">
                      <span className="text-base">📅</span>
                      <span>Harvest</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2420] tracking-tight mb-1">
                      {result.harvest?.expected_date}
                    </div>
                    <div className="text-xs text-[#5E645C] font-medium mb-1">
                      window {result.harvest?.window?.[0]} → {result.harvest?.window?.[1]}
                    </div>
                    <div className="text-[11px] text-[#426039] font-semibold bg-[#EFF4EC] inline-block px-2 py-0.5 rounded">
                      {result.harvest?.days_to_harvest < 0
                        ? `(${Math.abs(result.harvest.days_to_harvest)} days ago)`
                        : `(${result.harvest.days_to_harvest} days remaining)`}
                    </div>
                  </div>

                  {/* Crop Stage Card */}
                  <div className="bg-[#EFF4EC]/70 border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#426039] mb-2">
                      <span className="text-base">🌾</span>
                      <span>Crop stage today</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1F2420] tracking-tight mb-1">
                      {result.harvest?.crop_stage}
                    </div>
                    <div className="text-xs text-[#5E645C] font-medium">
                      {result.harvest?.days_after_sowing} days after sowing ({result.farmer?.sowing_date})
                    </div>
                  </div>

                </div>

                {/* 3. WHAT TO DO NOW */}
                <div className="bg-white border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                  <div className="text-xs font-bold text-[#1F2420] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#426039]" />
                    <span>What to do now</span>
                  </div>
                  <p className="text-sm text-[#1F2420] font-medium leading-relaxed">
                    {result.harvest?.stage_tip}
                  </p>
                </div>

                {/* 4. SELLING ADVICE CARD */}
                <div className="bg-[#FFFDF7] border-l-4 border-l-[#D97706] border border-[#F3E8D2] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg mt-0.5">💰</span>
                    <div className="flex-1 space-y-1.5">
                      <div className="text-sm sm:text-[15px] font-bold text-[#1F2420] leading-snug">
                        Selling advice:{" "}
                        <span className="text-[#B45309] font-extrabold uppercase">
                          {result.advisory?.decision}
                        </span>{" "}
                        (target: {result.advisory?.sell_when}) – expected ₹
                        {Number(result.advisory?.expected_net_price || 0).toLocaleString("en-IN")}/quintal
                      </div>
                      <p className="text-xs sm:text-sm text-[#5E645C] leading-relaxed">
                        {result.advisory?.reason}
                      </p>
                      {result.advisory?.reason_marathi && (
                        <p className="text-xs sm:text-sm text-[#1F2420] font-semibold bg-[#FEF3C7]/60 px-2.5 py-1 rounded-md inline-block">
                          मराठी: {result.advisory?.reason_marathi}
                        </p>
                      )}
                      <div className="text-[11px] text-[#5E645C] pt-1">
                        Price used: ₹{Number(result.advisory?.expected_net_price || 0).toLocaleString("en-IN")}/q as of {result.generated_on || "2026-09-24"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. YIELD OUTLOOK */}
                <div className="bg-white border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">📈</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#1F2420] uppercase tracking-wider mb-1">
                        Yield outlook
                      </div>
                      <p className="text-sm font-semibold text-[#1F2420] leading-relaxed">
                        {Math.round(result.yield_outlook?.kg_per_ha?.expected || 0).toLocaleString("en-IN")} kg/ha{" "}
                        <span className="text-xs font-normal text-[#5E645C]">
                          (range {Math.round(result.yield_outlook?.kg_per_ha?.low || 0).toLocaleString("en-IN")} – {Math.round(result.yield_outlook?.kg_per_ha?.high || 0).toLocaleString("en-IN")})
                        </span>{" "}
                        →{" "}
                        <span className="text-[#426039] font-bold">
                          {Math.round(result.yield_outlook?.production_quintals?.expected || 0)} quintals
                        </span>{" "}
                        <span className="text-xs font-normal text-[#5E645C]">
                          ({Math.round(result.yield_outlook?.production_quintals?.low || 0)}–{Math.round(result.yield_outlook?.production_quintals?.high || 0)})
                        </span>{" "}
                        · est. revenue ₹
                        {Math.round(result.advisory?.revenue_inr?.expected || 0).toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-[#5E645C]">
                          (₹{Math.round(result.advisory?.revenue_inr?.low || 0).toLocaleString("en-IN")} – ₹{Math.round(result.advisory?.revenue_inr?.high || 0).toLocaleString("en-IN")})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. SOIL ADVICE */}
                <div className="bg-white border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">🧪</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#1F2420] uppercase tracking-wider mb-1">
                        Soil
                      </div>
                      <p className="text-sm text-[#1F2420] font-medium leading-relaxed">
                        {result.soil?.note}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. ALERTS */}
                <div className="bg-white border border-[#E4E8E1] rounded-[16px] p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1F2420] uppercase tracking-wider mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <span>Alerts & Observations</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#1F2420]">
                    {result.alerts?.map((alert, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{alert}</span>
                      </li>
                    ))}
                    {result.crop_health?.message && (
                      <li className="flex items-start gap-2 leading-relaxed text-[#426039] font-medium bg-[#EFF4EC] p-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-[#426039] shrink-0 mt-0.5" />
                        <span>{result.crop_health.message}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* 8. MARKET OUTLOOK TABLE */}
                {result.market?.harvest_time_plan && result.market.harvest_time_plan.length > 0 && (
                  <div className="bg-white border border-[#E4E8E1] rounded-[16px] overflow-hidden shadow-2xs">
                    <div className="px-5 py-3.5 border-b border-[#E4E8E1] bg-[#FAFBF9] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#426039]" />
                        <h4 className="text-xs font-bold text-[#1F2420] uppercase tracking-wider">
                          Sangli APMC Post-Harvest Storage Outlook
                        </h4>
                      </div>
                      <span className="text-[10px] text-[#5E645C] font-mono">
                        Net ₹ after ₹{formData.storage_cost}/q storage & {formData.interest_percent}%/mo interest
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#F5F5F0] text-[#5E645C] font-semibold border-b border-[#E4E8E1]">
                          <tr>
                            <th className="py-2.5 px-4">Sell in</th>
                            <th className="py-2.5 px-4 text-right">Net ₹/quintal</th>
                            <th className="py-2.5 px-4 text-right">vs Harvest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E8E1]">
                          {result.market.harvest_time_plan.map((row, idx) => {
                            const isPositive = row.gain_pct > 0;
                            const isBaseline = row.gain_pct === 0;
                            return (
                              <tr
                                key={idx}
                                className={`hover:bg-[#FAFBF9] transition-colors ${
                                  idx === 0 ? "bg-[#EFF4EC]/30 font-medium" : ""
                                }`}
                              >
                                <td className="py-2.5 px-4 text-[#1F2420] font-medium">
                                  {row.sell_month}
                                  {idx === 0 && (
                                    <span className="ml-2 text-[10px] text-[#426039] bg-[#EFF4EC] px-1.5 py-0.5 rounded">
                                      Harvest
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#1F2420]">
                                  ₹{Math.round(row.net_price).toLocaleString("en-IN")}
                                </td>
                                <td
                                  className={`py-2.5 px-4 text-right font-mono font-semibold ${
                                    isBaseline
                                      ? "text-[#5E645C]"
                                      : isPositive
                                      ? "text-emerald-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {row.gain_pct >= 0 ? "+" : ""}
                                  {row.gain_pct.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 9. MODEL TRANSPARENCY & DISCLAIMER FOOTNOTE */}
                <div className="text-[11px] text-[#5E645C] leading-relaxed pt-2 px-1">
                  <p>
                    {result.disclaimer ||
                      "Prototype advisory based on 2017–2026 Sangli records. Yield is a range (few official seasons); soil factors are planning assumptions; harvest date uses typical crop duration."}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#5E645C]">
                    Model version {result.model_version || "0.2.0"} · Trained on Sangli Kharif historical observations and Sangli APMC market records.
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="mt-auto border-t border-[#E4E8E1] bg-white py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#5E645C] gap-2">
          <span>© 2026 KrishiLens · Sangli APMC & District Kharif Crop Intelligence</span>
          <div className="flex items-center gap-4">
            <button onClick={onHome} className="hover:text-[#1F2420] transition-colors cursor-pointer">
              Overview
            </button>
            {onWorkspace && (
              <button onClick={onWorkspace} className="hover:text-[#1F2420] transition-colors cursor-pointer">
                Full Workspace
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
