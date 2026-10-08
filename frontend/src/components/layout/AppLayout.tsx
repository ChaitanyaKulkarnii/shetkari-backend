import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHealth } from "../../api/queries";
import { Leaf, Menu, X, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "../ui";

export function AppLayout() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { data: health, isError } = useHealth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    const nextLang = i18n.language === "en" ? "mr" : i18n.language === "mr" ? "hi" : "en";
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: "/advisory", label: "Advisory" },
    { to: "/market", label: "Market Explorer" },
    { to: "/feedback", label: "Report Harvest" },
    { to: "/about", label: "About Model" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1F2420] flex flex-col font-sans selection:bg-[#EAF1E5] selection:text-[#426039]">
      {/* Clean White/Off-White Header inspired by prototype */}
      <header className="bg-[#FFFFFF] border-b border-[#E4E8E1] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          
          {/* Left Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            <div className="w-7 h-7 rounded-md bg-[#EAF1E5] flex items-center justify-center text-[#426039] shrink-0 border border-[#d8e3d2]">
              <Leaf className="w-4 h-4 fill-[#426039]/20 stroke-[#426039]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] sm:text-base tracking-tight text-[#1F2420] leading-none">
                Sangli Soybean Advisory
              </span>
              <span className="text-[11px] text-[#5E645C] font-medium mt-1 leading-none">
                Crop-to-Market Decision Support
              </span>
            </div>
          </Link>

          {/* Right Navigation & Status */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-[#426039]",
                      isActive
                        ? "text-[#426039] font-semibold"
                        : "text-[#5E645C]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-px bg-[#E4E8E1] hidden md:block" />

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-md border border-[#E4E8E1] text-xs font-semibold tracking-wider bg-[#EAF1E5] text-[#426039] hover:bg-[#dfeada] transition-all cursor-pointer"
              title="Switch language"
            >
              {i18n.language.toUpperCase()}
            </button>

            {/* Status indicator */}
            <div className="relative group flex items-center justify-center">
              {isError ? (
                <div className="text-red-600 p-0.5" title="Model offline">
                  <XCircle className="w-4.5 h-4.5" />
                </div>
              ) : health ? (
                <div
                  className="text-[#426039] p-0.5 flex items-center justify-center cursor-pointer"
                  title={`Status: Normal • Model v${health.model_version}`}
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[#E4E8E1] border-t-[#426039] animate-spin" />
              )}
              {health && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-[#FFFFFF] border border-[#E4E8E1] rounded-lg shadow-sm text-xs text-[#1F2420] hidden group-hover:block z-50">
                  <div className="font-semibold text-[#426039] flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#426039]" /> System Normal
                  </div>
                  <p className="text-[#5E645C] text-[11px]">Model: v{health.model_version}</p>
                  <p className="text-[#5E645C] text-[11px]">Market Data: {health.market_data_as_of}</p>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-md text-[#5E645C] hover:text-[#1F2420] hover:bg-[#EFF4EC] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E4E8E1] bg-[#FFFFFF] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-[#EAF1E5] text-[#426039] font-semibold"
                    : "text-[#5E645C] hover:text-[#1F2420] hover:bg-[#F5F5F0]"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-[#F5F5F0]">
        <Outlet />
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E4E8E1] py-6 text-center text-xs text-[#5E645C]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#1F2420] font-medium">
            <Leaf className="w-3.5 h-3.5 text-[#426039]" />
            <span>Sangli Soybean Advisory</span>
          </div>
          <p className="text-[#5E645C]">
            AI Crop Intelligence & Sangli Mandi Timing for Maharashtra Farmers.
          </p>
          <div className="text-[#5E645C]">
            &copy; {new Date().getFullYear()} Sangli Soybean Advisory
            {health && ` • Model v${health.model_version}`}
          </div>
        </div>
      </footer>
    </div>
  );
}
