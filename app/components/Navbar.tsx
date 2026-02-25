"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/i18n/context";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const links = [
    { href: "/calculator", label: t.nav.calculator },
    { href: "/method", label: t.nav.method },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
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
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Language toggle */}
          <div className="ml-1 flex items-center rounded-lg border border-border/60 p-0.5">
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                lang === "en"
                  ? "bg-primary text-white shadow-sm"
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
