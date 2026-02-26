"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/i18n/context";
import { useFullScreen } from "@/app/fullscreen-context";
import { useWeightUnit } from "@/app/weight-unit-context";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const { isFullScreen } = useFullScreen();
  const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit();

  const links = [
    { href: "/calculator", label: t.nav.calculator },
    { href: "/method", label: t.nav.method },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-colors ${
        isFullScreen
          ? "border-white/20 bg-white/10 backdrop-blur-md"
          : "border-border/60 bg-background/80 backdrop-blur-lg"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className={`flex items-center gap-2 text-lg font-bold tracking-tight ${
            isFullScreen ? "text-white" : "text-foreground"
          }`}
        >
          <span className="text-xl">🐾</span>
          PetPat
        </Link>

        <div className="flex items-center gap-3">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isFullScreen
                    ? active
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Weight unit toggle (only on calculator) */}
          {pathname === "/calculator" && (
            <div
              className={`flex items-center rounded-lg border p-0.5 ${
                isFullScreen ? "border-white/30" : "border-border/60"
              }`}
            >
              <button
                onClick={() => setWeightUnit("lb")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  weightUnit === "lb"
                    ? "bg-primary text-white shadow-sm"
                    : isFullScreen
                      ? "text-white/70 hover:text-white"
                      : "text-muted hover:text-foreground"
                }`}
              >
                lb
              </button>
              <button
                onClick={() => setWeightUnit("kg")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  weightUnit === "kg"
                    ? "bg-primary text-white shadow-sm"
                    : isFullScreen
                      ? "text-white/70 hover:text-white"
                      : "text-muted hover:text-foreground"
                }`}
              >
                kg
              </button>
            </div>
          )}

          {/* Language toggle */}
          <div
            className={`ml-1 flex items-center rounded-lg border p-0.5 ${
              isFullScreen ? "border-white/30" : "border-border/60"
            }`}
          >
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                lang === "en"
                  ? "bg-primary text-white shadow-sm"
                  : isFullScreen
                    ? "text-white/70 hover:text-white"
                    : "text-muted hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("zh")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                lang === "zh"
                  ? "bg-primary text-white shadow-sm"
                  : isFullScreen
                    ? "text-white/70 hover:text-white"
                    : "text-muted hover:text-foreground"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
