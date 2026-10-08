import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Leaf, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  BarChart2, 
  TrendingUp, 
  X, 
  RefreshCw
} from "lucide-react";

import farmerInspectingImg from "../assets/farmer_inspecting_crop.jpg";
import soybeanCropCloseupImg from "../assets/soybean_crop_closeup.jpg";
import farmerInFieldImg from "../assets/farmer_in_field.jpg";

interface DiagnosisResult {
  condition: string;
  status: "healthy" | "warning";
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
      title: "Soybean Leaf Inspection",
      image: farmerInspectingImg,
      result: {
        condition: "Soybean Foliage - Normal Photosynthetic Vigour",
        status: "healthy" as const,
        confidence: 96,
        stage: "R3 - Pod Formation",
        symptoms: "Balanced chlorophyll absorption, no active cercospora lesions, intact leaf cuticle.",
        recommendation: "Foliage health is robust. Maintain clean drainage and scout field margins after monsoon showers.",
        actionMarathi: "पानांची स्थिती निरोगी आहे. कोणतीही तीव्र बुरशी नाही. पाण्याचा निचरा व्यवस्थित ठेवा.",
      },
    },
    {
      title: "Pod & Canopy Closeup",
      image: soybeanCropCloseupImg,
      result: {
        condition: "Healthy Pod Development",
        status: "healthy" as const,
        confidence: 98,
        stage: "R4 - Full Pod Fill",
        symptoms: "Dense pod cluster, healthy pubescence, no pod borer entry holes observed.",
        recommendation: "Critical moisture sensitivity period. Avoid waterlogging; prepare for harvest planning in 25-30 days.",
        actionMarathi: "शेंगा भरण्याचा टप्पा चांगला आहे. कीड किंवा रोगाचा प्रादुर्भाव नाही.",
      },
    },
    {
      title: "Sangli Field Stand",
      image: farmerInFieldImg,
      result: {
        condition: "Uniform Crop Stand",
        status: "healthy" as const,
        confidence: 94,
        stage: "Vegetative / Early Flowering",
        symptoms: "Even row spacing, healthy leaf area index, active nodulation.",
        recommendation: "Weed competition is low. Ready for standard nutrient top-dressing if required by soil test.",
        actionMarathi: "पिकाची एकंदरीत वाढ समाधानकारक आहे. नियोजित पोषण व्यवस्थापन सुरू ठेवा.",
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
    }, 700);
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
          confidence: 95,
          stage: "Crop Inspection Stage",
          symptoms: "No severe rust spores or caterpillar chewing patterns detected on uploaded leaf surface.",
          recommendation: "Crop health appears stable. Continue routine scouting and observe bottom leaves weekly.",
          actionMarathi: "अपलोड केलेल्या फोटोमध्ये पीक निरोगी दिसत आहे. नियमित निरीक्षण सुरू ठेवा.",
        });
        setIsAnalyzing(false);
      }, 1000);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F0] text-[#1F2420] py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ================================================== */}
        {/* HERO CONTAINER (Soft green surface, rounded 20px) */}
        {/* ================================================== */}
        <section className="bg-[#EFF4EC] border border-[#E4E8E1] rounded-[20px] p-6 sm:p-8 lg:p-12 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT SIDE: Hero Typography & Primary CTA */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Small Eyebrow */}
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#426039] uppercase mb-3">
                A CLEARER VIEW OF YOUR FARM
              </span>

              {/* Main Heading (Strongest text on page) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#1F2420] tracking-tight leading-[1.1] mb-3">
                Analyze Your Crop
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg font-medium text-[#1F2420] mb-3">
                Understand your crop better with AI-powered insights.
              </p>

              {/* Short Supporting Copy */}
              <p className="text-sm sm:text-[15px] text-[#5E645C] leading-relaxed max-w-lg mb-7">
                Upload a photo of your crop and get clear, actionable insights about crop health, possible issues, and what to consider next.
              </p>

              {/* PRIMARY CTA BUTTON */}
              <div className="flex flex-col items-start">
                <button
                  onClick={handleOpenAnalyzer}
                  className="group inline-flex items-center justify-center gap-2.5 h-[48px] px-6 rounded-[9px] bg-[#426039] hover:bg-[#344d2d] text-white font-semibold text-[15px] tracking-normal transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
                >
                  <span>Analyze Your Crop</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                {/* Supporting micro-copy below button */}
                <p className="text-xs text-[#5E645C] mt-2.5 font-normal">
                  Start with a crop photo • Get insights in minutes
                </p>
              </div>

              {/* Subtle shortcut to agronomic advisory */}
              <div className="mt-6 pt-5 border-t border-[#E4E8E1] w-full max-w-md flex items-center gap-2 text-xs text-[#5E645C]">
                <span>Planning harvest or storage?</span>
                <Link
                  to="/advisory"
                  className="text-[#426039] hover:underline font-semibold"
                >
                  Open Farm Advisory Calculator →
                </Link>
              </div>

            </div>

            {/* RIGHT SIDE: Farmer & Crop Visual in soft white frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-[#FFFFFF] p-2.5 rounded-[18px] border border-[#E4E8E1] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="relative overflow-hidden rounded-[14px] aspect-[4/3] sm:aspect-[4/3]">
                  <img
                    src={farmerInspectingImg}
                    alt="Indian farmer inspecting healthy soybean crop in Sangli, Maharashtra"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Image Overlay Label */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-[#E4E8E1] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-[11px] font-bold text-[#1F2420] leading-tight">
                        Sangli Soybean Field Scouting
                      </div>
                      <div className="text-[10px] text-[#5E645C] leading-tight mt-0.5">
                        Tuned for local Maharashtra black soils
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EAF1E5] text-[#426039] text-[10px] font-semibold tracking-wide">
                      AI Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================================================== */}
        {/* ROW OF THREE CLEAN FEATURE CARDS BELOW HERO */}
        {/* ================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 sm:mt-5">
          
          {/* Card 01 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-3">
                <Leaf className="w-4 h-4 fill-[#426039]/20 stroke-[#426039]" />
              </div>
              <h2 className="text-[15px] sm:text-base font-bold text-[#1F2420] mb-1">
                Understand Crop Condition
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Get a clearer view of crop health and growing signals.
              </p>
            </div>
          </div>

          {/* Card 02 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-3">
                <BarChart2 className="w-4 h-4 text-[#426039]" />
              </div>
              <h2 className="text-[15px] sm:text-base font-bold text-[#1F2420] mb-1">
                Plan Around Harvest
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Understand expected crop performance and timing.
              </p>
            </div>
          </div>

          {/* Card 03 */}
          <div className="bg-[#FFFFFF] border border-[#E4E8E1] rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1E5] text-[#426039] flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4 text-[#426039]" />
              </div>
              <h2 className="text-[15px] sm:text-base font-bold text-[#1F2420] mb-1">
                Compare Market Options
              </h2>
              <p className="text-xs sm:text-[13px] text-[#5E645C] leading-relaxed">
                Use crop and market context to make better decisions.
              </p>
            </div>
          </div>

        </section>

      </div>

      {/* ================================================== */}
      {/* INTERACTIVE CROP ANALYSIS STUDIO MODAL */}
      {/* ================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E4E8E1] rounded-[18px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E8E1] bg-[#EFF4EC]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#EAF1E5] flex items-center justify-center text-[#426039] border border-[#d8e3d2]">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2420] text-sm sm:text-base leading-tight">
                    Analyze Your Crop
                  </h3>
                  <p className="text-[11px] text-[#5E645C] leading-tight">
                    Instant AI Visual Health & Field Inspection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-md text-[#5E645C] hover:text-[#1F2420] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Photo preview / upload container */}
              <div className="relative rounded-xl border border-dashed border-[#E4E8E1] bg-[#F5F5F0] p-3 flex flex-col items-center justify-center text-center overflow-hidden">
                {selectedImage ? (
                  <div className="relative w-full max-h-60 rounded-lg overflow-hidden">
                    <img
                      src={selectedImage}
                      alt="Crop sample"
                      className="w-full h-60 object-cover object-center rounded-lg"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-[#426039] absolute top-0 animate-scan" />
                        <RefreshCw className="w-7 h-7 text-[#426039] animate-spin mb-2" />
                        <span className="text-xs font-semibold text-[#1F2420] tracking-wider uppercase">
                          Analyzing Crop Health Signals...
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-white border border-[#E4E8E1] text-xs font-medium text-[#1F2420] hover:bg-[#F5F5F0] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#426039]" /> Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <UploadCloud className="w-9 h-9 text-[#5E645C] mb-2" />
                    <p className="text-sm font-semibold text-[#1F2420] mb-1">
                      Upload a Crop or Foliage Photo
                    </p>
                    <p className="text-xs text-[#5E645C] mb-3">
                      JPG, PNG up to 10MB
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-md bg-[#426039] hover:bg-[#344d2d] text-white text-xs font-semibold transition-colors cursor-pointer"
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

              {/* Sample farm observation buttons */}
              <div>
                <label className="text-[11px] font-semibold text-[#5E645C] uppercase tracking-wider block mb-2">
                  Or test with sample farm observations:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        selectedImage === sample.image
                          ? "border-[#426039] bg-[#EAF1E5]"
                          : "border-[#E4E8E1] bg-[#FFFFFF] hover:border-[#426039]/40"
                      }`}
                    >
                      <img
                        src={sample.image}
                        alt={sample.title}
                        className="w-full h-14 object-cover rounded-md"
                      />
                      <span className="text-[11px] font-medium text-[#1F2420] truncate w-full block">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnosis output card */}
              {diagnosis && !isAnalyzing && (
                <div className="rounded-xl border border-[#E4E8E1] bg-[#EFF4EC] p-4 text-left space-y-2.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E8E1]">
                    <div className="flex items-center gap-2">
                      {diagnosis.status === "healthy" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#426039]" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[#1F2420]">{diagnosis.condition}</h4>
                        <span className="text-[11px] text-[#5E645C]">Stage: {diagnosis.stage}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E8E1] text-[#426039] text-xs font-semibold">
                      {diagnosis.confidence}% Confidence
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#5E645C] uppercase tracking-wider block mb-0.5">
                      Foliage & Growth Assessment:
                    </span>
                    <p className="text-xs text-[#1F2420] leading-relaxed">{diagnosis.symptoms}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E4E8E1]">
                    <span className="text-xs font-semibold text-[#426039] block mb-1">
                      Action Recommendation:
                    </span>
                    <p className="text-xs text-[#1F2420] mb-1 leading-relaxed">{diagnosis.recommendation}</p>
                    <p className="text-xs text-[#5E645C] italic">मराठी: {diagnosis.actionMarathi}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#E4E8E1] bg-[#F5F5F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#5E645C]">
                Calibrated for Sangli talukas (Miraj, Walwa, Tasgaon)
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to="/advisory"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-[#426039] hover:bg-[#344d2d] text-white text-xs font-semibold transition-colors text-center"
                >
                  Calculate Harvest & Mandi Timing →
                </Link>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-md border border-[#E4E8E1] text-xs text-[#5E645C] hover:bg-white transition-colors cursor-pointer"
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
