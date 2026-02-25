"use client";

import Link from "next/link";
import { useT } from "@/app/i18n/context";

export default function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-foreground"
            >
              <span className="text-xl">🐾</span>
              PetPat
            </Link>
            <p className="mt-2 max-w-md text-sm text-muted">
              {t.footer.desc}
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <Link
              href="/calculator"
              className="text-muted transition-colors hover:text-foreground"
            >
              {t.nav.calculator}
            </Link>
            <Link
              href="/method"
              className="text-muted transition-colors hover:text-foreground"
            >
              {t.nav.method}
            </Link>
          </div>

          <div className="w-full border-t border-border pt-6">
            <p className="text-xs text-muted">{t.footer.disclaimer}</p>
            <p className="mt-2 text-xs text-muted/60">
              {t.footer.copyright.replace(
                "{year}",
                String(new Date().getFullYear()),
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
