"use client";

import Link from "next/link";
import { useT } from "@/app/i18n/context";

export default function Home() {
  const t = useT();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[.04] via-background to-accent/[.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(27,67,50,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center lg:pb-28 lg:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            🐾 {t.home.badge}
          </div>

          <h1 className="mx-auto mt-8 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.home.titleBefore}
            <span className="text-primary">{t.home.titleHighlight}</span>
            {t.home.titleAfter}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted lg:text-xl">
            {t.home.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
            >
              {t.home.cta}
              <span className="text-lg">→</span>
            </Link>
            <Link
              href="/method"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              {t.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t.home.featuresTitle}
            </h2>
            <p className="mt-3 text-muted">{t.home.featuresSubtitle}</p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {t.home.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border/60 bg-background p-8 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[.03]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t.home.stepsTitle}
            </h2>
            <p className="mt-3 text-muted">{t.home.stepsSubtitle}</p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {t.home.steps.map((s) => (
              <div key={s.num} className="relative">
                <span className="text-5xl font-bold text-primary/10">
                  {s.num}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {t.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            {t.home.ctaDesc}
          </p>
          <Link
            href="/calculator"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t.home.ctaButton}
            <span className="text-lg">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
