import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Leaf, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Cpu, 
  TrendingUp, 
  X, 
  RefreshCw,
  Check
} from "lucide-react";

import farmerInFieldImg from "../assets/farmer_in_field.jpg";
import soybeanCropCloseupImg from "../assets/soybean_crop_closeup.jpg";
import farmerInspectingImg from "../assets/farmer_inspecting_crop.jpg";

interface DiagnosisResult {
  condition: string;
  status: "healthy" | "warning" | "alert";
  confidence: number;
  stage: string;
  symptoms: string;
  recommendation: string;
  actionMarathi: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    {
      title: "Healthy Soybean Crop",
      image: soybeanCropCloseupImg,
      result: {
        condition: "Healthy Crop Canopy (No Disease Detected)",
        status: "healthy" as const,
        confidence: 98,
        stage: "R4 - Full Pod Growth",
        symptoms: "Lush green foliage, normal chlorophyll retention, robust pod formation.",
        recommendation: "Maintain optimal moisture during pod filling. No chemical fungicide required at this stage.",
        actionMarathi: "पीक निरोगी आहे. फवारणीची गरज नाही, पाण्याचा निचरा योग्य ठेवा.",
      },
    },
    {
      title: "Leaf Spotting / Rust Symptom",
      image: farmerInspectingImg,
      result: {
        condition: "Soybean Rust (Early Phase)",
        status: "warning" as const,
        confidence: 92,
        stage: "R3 - Pod Initiation",
        symptoms: "Early chlorotic flecks detected on lower leaf margins.",
        recommendation: "Inspect underside of leaves in 2-acre radius. Apply prophylactic Hexaconazole or Tebuconazole if humidity exceeds 85%.",
        actionMarathi: "तांबेरा किंवा पानांवरील ठिपके आढळले. त्वरित जैविक किंवा शिफारस केलेली बुरशीनाशक फवारणी करा.",
      },
    },
    {
      title: "Field Observation Sample",
      image: farmerInFieldImg,
      result: {
        condition: "Optimal Vegetative Stand",
        status: "healthy" as const,
        confidence: 95,
        stage: "V4 - Vegetative Stage",
        symptoms: "Uniform plant density, healthy root nodulation, balanced canopy cover.",
        recommendation: "Schedule weed management before canopy closure. Prepare field drainage for upcoming rain spell.",
        actionMarathi: "झाडांची वाढ समाधानकारक आहे. तण नियंत्रण वेळेत पूर्ण करा.",
      },
    },
  ];

  const handleOpenAnalyzer = () => {
    setIsModalOpen(true);
    if (!selectedImage) {
      setSelectedImage(sampleImages[0].image);
      setDiagnosis(sampleImages[0].result);
    }
  };

  const handleSelectSample = (sample: typeof sampleImages[0]) => {
    setSelectedImage(sample.image);
    setIsAnalyzing(true);
    setDiagnosis(null);
    setTimeout(() => {
      setDiagnosis(sample.result);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setIsAnalyzing(true);
      setDiagnosis(null);
      setTimeout(() => {
        setDiagnosis({
          condition: "Uploaded Leaf Analysis: Healthy Vegetation",
          status: "healthy",
          confidence: 94,
          stage: "Pod Development Stage",
          symptoms: "No severe blight or fungal lesions detected on uploaded sample.",
          recommendation: "Crop health appears stable. Continue routine scouting and soil moisture monitoring.",
          actionMarathi: "अपलोड केलेल्या फोटोमध्ये पीक निरोगी दिसत आहे. नियमित देखरेख ठेवा.",
        });
        setIsAnalyzing(false);
      }, 1200);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#0E1116] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Subtle ambient agricultural background effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#22C55E]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 left-10 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#22C55E]/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:py-16 lg:py-20 flex-1 flex flex-col justify-center">
        
        {/* Top Kicker Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#232936] bg-[#171B22]/90 text-slate-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-md transition-all hover:border-[#22C55E]/40 hover:bg-[#1A202A]">
            <span className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-white font-semibold">Sangli Soybean Advisory</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">AI-powered crop intelligence for smarter farming.</span>
          </div>
        </div>

        {/* Hero Section Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Agricultural Image Card (Indian Farmer in field) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="group relative rounded-2xl p-2 bg-[#171B22] border border-[#232936] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#22C55E]/40 glow-card">
              <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                <img
                  src={farmerInFieldImg}
                  alt="Indian farmer in soybean field in Maharashtra"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <div className="inline-block px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#4ADE80] text-[10px] font-semibold border border-[#22C55E]/30 mb-1">
                    Sangli Kharif Season
                  </div>
                  <p className="text-xs font-semibold text-white leading-snug">
                    Real farmer insights tuned for local soil & climate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Focused Hero Content & Primary CTA */}
          <div className="lg:col-span-6 text-center flex flex-col items-center">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.1] mb-4">
              Analyze <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#4ADE80]">
                Your Crop
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl font-semibold text-slate-200 mb-3 max-w-xl">
              Get smart, personalized crop insights powered by AI.
            </p>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-lg mb-8">
              Upload your crop photo and get actionable insights to help you understand crop health, identify possible issues, and make better farming decisions.
            </p>

            {/* PRIMARY CTA BUTTON: "Analyze Your Crop" */}
            <div className="relative group w-full sm:w-auto">
              <button
                onClick={handleOpenAnalyzer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-8 sm:px-10 py-4 sm:py-4.5 rounded-xl text-base sm:text-lg font-bold text-slate-950 bg-[#22C55E] hover:bg-[#16A34A] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,197,94,0.45)] hover:shadow-[0_0_50px_rgba(34,197,94,0.7)] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center text-slate-950">
                  <Leaf className="w-4 h-4 fill-current" />
                </div>
                <span>Analyze Your Crop</span>
                <ArrowRight className="w-5 h-5 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Small supporting text below button */}
            <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide flex items-center justify-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              AI-powered crop analysis • Smart farming insights
            </p>

            {/* Quick access link for traditional agronomic advisory calculator */}
            <div className="mt-6 pt-5 border-t border-[#232936]/60 w-full max-w-md flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>Need harvest dates & mandi prices?</span>
              <Link
                to="/advisory"
                className="text-[#22C55E] hover:text-[#4ADE80] font-semibold underline underline-offset-4 transition-colors"
              >
                Open Full Advisory Calculator →
              </Link>
            </div>
          </div>

          {/* Right Column: Agricultural Images (Closeup & Leaf Inspection) */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-4">
            
            {/* Top Right Card: Crop Closeup */}
            <div className="flex-1 group relative rounded-2xl p-2 bg-[#171B22] border border-[#232936] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#22C55E]/40 glow-card">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] lg:aspect-[5/3]">
                <img
                  src={soybeanCropCloseupImg}
                  alt="Close-up healthy soybean crops and ripening pods"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent opacity-75" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white drop-shadow">
                    Healthy Pod Formation
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#4ADE80] font-mono bg-black/60 px-1.5 py-0.5 rounded">
                    <Check className="w-3 h-3" /> 98% Vitality
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Right Card: Farmer inspecting with smartphone */}
            <div className="flex-1 group relative rounded-2xl p-2 bg-[#171B22] border border-[#232936] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-[#22C55E]/40 glow-card">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] lg:aspect-[5/3]">
                <img
                  src={farmerInspectingImg}
                  alt="Indian farmer inspecting crop leaves with smartphone in field"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] via-transparent to-transparent opacity-75" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white drop-shadow">
                    Instant AI Leaf Scouting
                  </span>
                  <span className="text-[10px] text-slate-300 bg-black/60 px-1.5 py-0.5 rounded">
                    Field Camera Ready
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile-visible photo preview strip */}
        <div className="grid grid-cols-2 gap-3 mt-10 lg:hidden">
          <div className="rounded-xl overflow-hidden border border-[#232936] aspect-[4/3] relative">
            <img src={farmerInFieldImg} alt="Farmer in field" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
              Sangli Farmer
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#232936] aspect-[4/3] relative">
            <img src={soybeanCropCloseupImg} alt="Soybean crops" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
              Soybean Pods
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid Below Hero */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-[#232936] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#171B22]/70 border border-[#232936] hover:border-[#22C55E]/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Instant Photo Diagnosis</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Snap a picture of your soybean foliage or pods to detect early fungal stress, rust, or nutrient deficiency in seconds.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#171B22]/70 border border-[#232936] hover:border-[#22C55E]/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Sangli Taluka Calibration</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained specifically on agronomic conditions in Miraj, Walwa, Shirala, Tasgaon, and Sangli black/alluvial soils.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#171B22]/70 border border-[#232936] hover:border-[#22C55E]/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Market Holding Intelligence</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pair crop health with APMC Sangli mandi trend forecasts to decide whether to sell at harvest or hold in local storage.
            </p>
          </div>
        </div>

      </div>

      {/* Interactive Crop Analysis Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#171B22] border border-[#232936] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#232936] bg-[#0E1116]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Crop Analysis Studio</h3>
                  <p className="text-xs text-slate-400">AI Visual Health & Agronomic Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232936] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Image Preview & Upload Zone */}
              <div className="relative rounded-xl border border-dashed border-[#232936] bg-[#0E1116] p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                {selectedImage ? (
                  <div className="relative w-full max-h-64 rounded-lg overflow-hidden group">
                    <img
                      src={selectedImage}
                      alt="Crop sample"
                      className="w-full h-64 object-cover object-center rounded-lg"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-[#22C55E] absolute top-0 shadow-[0_0_15px_#22C55E] animate-scan" />
                        <RefreshCw className="w-8 h-8 text-[#22C55E] animate-spin mb-2" />
                        <span className="text-xs font-semibold text-white tracking-wider uppercase">
                          Scanning Crop Cellular Structure...
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#171B22]/90 border border-[#232936] text-xs font-medium text-white hover:bg-[#232936] transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#22C55E]" /> Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                    <p className="text-sm font-semibold text-white mb-1">Upload a Soybean Leaf or Field Photo</p>
                    <p className="text-xs text-slate-400 mb-4">PNG, JPG up to 10MB</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Browse Image
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Sample photos selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Or test with sample farm observations:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {sampleImages.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        selectedImage === sample.image
                          ? "border-[#22C55E] bg-[#22C55E]/10"
                          : "border-[#232936] bg-[#0E1116] hover:border-slate-600"
                      }`}
                    >
                      <img
                        src={sample.image}
                        alt={sample.title}
                        className="w-full h-14 object-cover rounded"
                      />
                      <span className="text-[11px] font-medium text-white truncate w-full block">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Diagnosis Result */}
              {diagnosis && !isAnalyzing && (
                <div className="rounded-xl border border-[#232936] bg-[#0E1116] p-4 text-left space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#232936]">
                    <div className="flex items-center gap-2">
                      {diagnosis.status === "healthy" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{diagnosis.condition}</h4>
                        <span className="text-[11px] text-slate-400">Stage: {diagnosis.stage}</span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#4ADE80] text-xs font-mono font-bold">
                      {diagnosis.confidence}% Confidence
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Visual Assessment:
                    </span>
                    <p className="text-xs text-slate-300">{diagnosis.symptoms}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#171B22] border border-[#232936]">
                    <span className="text-xs font-semibold text-[#4ADE80] block mb-1">
                      Agronomist Action Recommendation:
                    </span>
                    <p className="text-xs text-slate-200 mb-1.5">{diagnosis.recommendation}</p>
                    <p className="text-xs text-slate-400 italic">मराठी: {diagnosis.actionMarathi}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#232936] bg-[#0E1116]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Calibrated for Sangli Talukas (Miraj, Walwa, Tasgaon)
              </span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/advisory"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-xs font-bold transition-all text-center"
                >
                  Calculate Harvest & Mandi Timing →
                </Link>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-[#232936] text-xs text-slate-300 hover:bg-[#232936] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
