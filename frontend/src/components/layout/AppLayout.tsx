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
    <div className="min-h-screen bg-[#0E1116] text-slate-100 flex flex-col font-sans selection:bg-[#22C55E]/30 selection:text-white">
      {/* Dark Agri Header matching reference */}
      <header className="bg-[#0E1116]/95 backdrop-blur-md border-b border-[#232936] sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E]/20 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.25)]">
              <Leaf className="w-5 h-5 fill-[#22C55E]/20 stroke-[#22C55E]" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-[#22C55E] transition-colors">
              Sangli Soybean Advisory
            </span>
          </Link>

          {/* Nav & Controls */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-[#22C55E]",
                      isActive
                        ? "text-[#22C55E]"
                        : "text-slate-400"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-px bg-[#232936] hidden md:block" />

            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2.5 py-1 rounded-md border border-[#22C55E]/30 text-xs font-semibold tracking-wider bg-[#16271D] text-[#4ADE80] hover:bg-[#1C3325] hover:border-[#22C55E]/60 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Switch language"
            >
              {i18n.language.toUpperCase()}
            </button>

            {/* Status indicator matching reference */}
            <div className="relative group flex items-center justify-center">
              {isError ? (
                <div className="text-red-400 p-1" title="Model offline">
                  <XCircle className="w-5 h-5" />
                </div>
              ) : health ? (
                <div
                  className="text-[#22C55E] p-1 flex items-center justify-center relative cursor-pointer"
                  title={`Status: Online • Model v${health.model_version}`}
                >
                  <span className="absolute w-3 h-3 rounded-full bg-[#22C55E]/40 animate-ping" />
                  <CheckCircle2 className="w-5 h-5 relative z-10" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-[#22C55E] animate-spin" />
              )}
              {health && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-[#171B22] border border-[#232936] rounded-lg shadow-2xl text-xs text-slate-300 hidden group-hover:block z-50">
                  <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> System Online
                  </div>
                  <p className="text-slate-400 text-[11px]">Model: v{health.model_version}</p>
                  <p className="text-slate-400 text-[11px]">Updated: {health.market_data_as_of}</p>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#171B22] border border-[#232936] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#232936] bg-[#171B22] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-[#22C55E]/10 text-[#22C55E]"
                    : "text-slate-300 hover:text-white hover:bg-[#232936]"
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
      <main className="flex-1 w-full bg-agri-dark">
        <Outlet />
      </main>

      {/* Dark Footer */}
      <footer className="bg-[#0E1116] border-t border-[#232936] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Leaf className="w-4 h-4 text-[#22C55E]" />
            <span>Sangli Soybean Advisory</span>
          </div>
          <p className="text-slate-500">
            Empowering Maharashtra farmers with agronomic AI, Kharif harvest forecasts & mandi intelligence.
          </p>
          <div className="text-slate-500">
            &copy; {new Date().getFullYear()} Sangli Soybean Advisory
            {health && ` • Model v${health.model_version}`}
          </div>
        </div>
      </footer>
    </div>
  );
}
