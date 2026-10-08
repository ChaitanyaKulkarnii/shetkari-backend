import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHealth } from "../../api/queries";
import { Leaf, Menu, X, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "../ui";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { data: health, isError } = useHealth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    const nextLang = i18n.language === "en" ? "mr" : i18n.language === "mr" ? "hi" : "en";
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: "/", label: t("nav.advisory") },
    { to: "/market", label: t("nav.market") },
    { to: "/feedback", label: t("nav.feedback") },
    { to: "/about", label: t("nav.about") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-green-700">
            <Leaf className="w-6 h-6" />
            <span className="font-bold text-lg hidden sm:block">{t("app.title")}</span>
            <span className="font-bold text-lg sm:hidden">Krishi</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-green-700",
                    location.pathname === link.to ? "text-green-700" : "text-slate-600"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded border text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              {i18n.language.toUpperCase()}
            </button>

            <div className="relative group flex items-center justify-center">
              {isError ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : health ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-green-500 animate-spin" />
              )}
              {health && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-white border rounded shadow-lg text-xs hidden group-hover:block z-50">
                  <p>Status: OK</p>
                  <p>Model: {health.model_version}</p>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-2">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "block px-2 py-3 rounded-md text-base font-medium",
                    location.pathname === link.to
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-6 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <p>{t("result.disclaimer")}</p>
          <p>
            {t("app.title")} &copy; {new Date().getFullYear()}
            {health && ` • Model ${health.model_version}`}
          </p>
        </div>
      </footer>
    </div>
  );
}
