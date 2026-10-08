import React from "react";
import {
  Sprout,
  Leaf,
  ArrowRight,
  BarChart2,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Compass,
  MapPin,
  Sparkles,
  Layers3
} from "lucide-react";

import farmerInspectingImg from "../assets/farmer_inspecting_crop.jpg";
import soybeanCropCloseupImg from "../assets/soybean_crop_closeup.jpg";
import farmerInFieldImg from "../assets/farmer_in_field.jpg";

export default function LandingPage({ onAnalyze, onWorkspace }) {
  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] text-[#1F2420] flex flex-col font-sans">
      
      {/* ================================================== */}
      {/* TOP NAVIGATION BAR */}
      {/* ================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E8E1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#426039] text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#1F2420] leading-none tracking-tight">
                Krishi<span className="font-medium text-[#5E645C]">Lens</span>
              </span>
              <small className="text-[10px] text-[#5E645C] font-medium leading-tight mt-0.5 hidden sm:block">
                Crop-to-Market Decision Support
              </small>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5E645C]">
            <a href="#features" className="hover:text-[#1F2420] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1F2420] transition-colors">
              How It Works
            </a>
            <a href="#mandi" className="hover:text-[#1F2420] transition-colors">
              Mandi Intelligence
            </a>
            {onWorkspace && (
              <button 
                onClick={onWorkspace}
                className="hover:text-[#426039] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Layers3 className="w-3.5 h-3.5" /> Workspace View
              </button>
            )}
          </nav>

          {/* Nav Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onAnalyze}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#426039] hover:bg-[#344d2d] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Analyze Your Crop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ================================================== */}
      {/* MAIN HERO SECTION */}
      {/* ================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        
        <section className="bg-[#EFF4EC] border border-[#E4E8E1] rounded-[20px] p-6 sm:p-10 lg:p-12 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Typography */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#E4E8E1] text-[#426039] text-[11px] font-bold uppercase tracking-wider mb-4 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#426039]" />
                <span>AI CROP INTELLIGENCE · SANGLI DISTRICT</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#1F2420] tracking-tight leading-[1.12] mb-4">
                Analyze Your Crop.
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl font-medium text-[#1F2420] mb-3">
                Understand your harvest timing, yield outlook, and mandi price strategy.
              </p>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-[15px] text-[#5E645C] leading-relaxed max-w-lg mb-8">
                Powered by calibrated Kaggle models trained on 2017–2026 Sangli Kharif agro-climatic records, Sentinel satellite observations, and Sangli APMC market trends.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onAnalyze}
                  className="group inline-flex items-center justify-center gap-2.5 h-[50px] px-7 rounded-[10px] bg-[#426039] hover:bg-[#344d2d] text-white font-semibold text-[15px] tracking-normal transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span>Analyze Your Crop</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                {onWorkspace && (
                  <button
                    onClick={onWorkspace}
                    className="inline-flex items-center justify-center gap-2 h-[50px] px-5 rounded-[10px] bg-white hover:bg-[#FAFBF9] border border-[#E4E8E1] text-[#1F2420] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>Open Dashboard Demo</span>
                  </button>
                )}
              </div>

              {/* Micro-proof */}
              <div className="flex items-center gap-2 text-xs text-[#5E645C] mt-4">
                <CheckCircle2 className="w-4 h-4 text-[#426039]" />
                <span>100% Real Kaggle-trained Model · Takes ~30 seconds</span>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#FFFFFF] p-3 rounded-[18px] border border-[#E4E8E1] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="relative overflow-hidden rounded-[14px] aspect-[4/3]">
                  <img
                    src={farmerInspectingImg}
                    alt="Indian farmer inspecting healthy soybean crop in Sangli, Maharashtra"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-[#E4E8E1] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-[11px] font-bold text-[#1F2420] leading-tight">
                        Sangli Soybean Field Scouting
                      </div>
                      <div className="text-[10px] text-[#5E645C] leading-tight mt-0.5">
                        Tuned for Maharashtra deep black & medium soils
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EAF1E5] text-[#426039] text-[10px] font-bold tracking-wide">
                      AI Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================================================== */}
        {/* LIVE APMC MANDI TICKER STRIP */}
        {/* ================================================== */}
        <section id="mandi" className="rounded-xl border border-[#E4E8E1] bg-white p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold text-[#1F2420] uppercase tracking-wider">
              Sangli APMC Mandi Benchmark:
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5E645C]">Current Modal Price:</span>
              <strong className="text-[#1F2420] font-bold">₹6,080 / quintal</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#5E645C]">12-Month Range:</span>
              <span className="font-semibold text-[#1F2420]">₹5,855 – ₹7,250</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#5E645C]">Historical Peak Month:</span>
              <span className="font-semibold text-[#426039]">December (+3% index)</span>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3 VALUE PILLAR CARDS */}
        {/* ================================================== */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 01 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#426039]/40 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5 fill-[#426039]/20 stroke-[#426039]" />
              </div>
              <h2 className="text-base font-bold text-[#1F2420] mb-1.5">
                Understand Crop Condition
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Vegetative vigor tracking, stage determination (vegetative, pod fill, maturity), and soil moisture advice calibrated for local talukas.
              </p>
            </div>
          </div>

          {/* Card 02 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#426039]/40 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5 text-[#426039]" />
              </div>
              <h2 className="text-base font-bold text-[#1F2420] mb-1.5">
                Plan Around Harvest
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Predicted harvest date, ±5 day window, expected production in quintals, and total farm revenue estimates based on variety duration.
              </p>
            </div>
          </div>

          {/* Card 03 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#426039]/40 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-4">
                <Compass className="w-5 h-5 text-[#426039]" />
              </div>
              <h2 className="text-base font-bold text-[#1F2420] mb-1.5">
                Compare Selling Timing
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Simulates month-by-month warehouse storage costs and finance interest against seasonal Mandi price tilts to tell you when to sell.
              </p>
            </div>
          </div>

        </section>

        {/* ================================================== */}
        {/* HOW IT WORKS SECTION */}
        {/* ================================================== */}
        <section id="how-it-works" className="bg-white border border-[#E4E8E1] rounded-[20px] p-6 sm:p-10">
          <div className="max-w-2xl text-left mb-8">
            <span className="text-[11px] font-bold text-[#426039] uppercase tracking-wider block mb-2">
              SEAMLESS 4-STEP ADVISORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2420] tracking-tight">
              From Farm Inputs to Personalized AI Guidance
            </h2>
            <p className="text-xs sm:text-sm text-[#5E645C] mt-1.5">
              No generic estimates. The backend evaluates your specific taluka, variety, and storage costs through our machine learning model.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#F5F5F0] border border-[#E4E8E1] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#426039] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-[#1F2420]">Enter Farm Details</h3>
              <p className="text-xs text-[#5E645C] leading-relaxed">
                Provide your farmer name, Sangli taluka, sowing date, soil type, and variety.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F0] border border-[#E4E8E1] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#426039] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-[#1F2420]">Model Analysis</h3>
              <p className="text-xs text-[#5E645C] leading-relaxed">
                Kaggle-trained model evaluates 8 Kharif seasons, vegetative anomalies, and soil retention.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F0] border border-[#E4E8E1] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#426039] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h3 className="text-sm font-bold text-[#1F2420]">Mandi Simulation</h3>
              <p className="text-xs text-[#5E645C] leading-relaxed">
                Projects 6-month holding costs vs seasonal price gains to recommend "HOLD" vs "SELL".
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F0] border border-[#E4E8E1] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#426039] text-white text-xs font-bold flex items-center justify-center">4</span>
              <h3 className="text-sm font-bold text-[#1F2420]">Actionable Advisory</h3>
              <p className="text-xs text-[#5E645C] leading-relaxed">
                Receive personalized guidance in English and Marathi with harvest window and yield range.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E4E8E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs text-[#5E645C]">
              Supports all 10 Sangli talukas: Miraj, Walwa, Tasgaon, Shirala, Palus, Kadegaon, Khanapur, Atpadi, Jath, Kavathe Mahankal.
            </span>
            <button
              onClick={onAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#426039] hover:bg-[#344d2d] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* BOTTOM CALL TO ACTION BANNER */}
        {/* ================================================== */}
        <section className="rounded-[20px] bg-[#426039] text-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EAF1E5]">
            GET STARTED IN UNDER A MINUTE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-xl">
            Ready to plan your harvest and sell with confidence?
          </h2>
          <p className="text-sm text-[#EFF4EC] max-w-lg leading-relaxed">
            Enter your crop details to see expected harvest dates, quintal production forecasts, and real carrying cost simulations.
          </p>
          <div className="pt-2">
            <button
              onClick={onAnalyze}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-white hover:bg-[#F5F5F0] text-[#1F2420] text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Analyze Your Crop Now</span>
              <ArrowRight className="w-4 h-4 text-[#426039]" />
            </button>
          </div>
        </section>

      </main>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E4E8E1] py-8 text-xs text-[#5E645C] mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#426039]" />
            <span className="font-bold text-[#1F2420]">KrishiLens</span>
            <span>· Crop-to-Market Decision Support for Maharashtra</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Model v0.2.0</span>
            <span>Sangli APMC Data</span>
            {onWorkspace && (
              <button onClick={onWorkspace} className="text-[#426039] hover:underline cursor-pointer font-semibold">
                Open Workspace View
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
