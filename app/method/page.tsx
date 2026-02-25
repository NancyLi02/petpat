"use client";

import { useT } from "@/app/i18n/context";

export default function MethodPage() {
  const t = useT();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
      {/* Header */}
      <header className="mb-14">
        <h1 className="text-4xl font-bold tracking-tight">{t.method.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t.method.desc}</p>
      </header>

      {/* Cost Categories */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold">
          {t.method.costCategoriesTitle}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.method.categories.map((cat) => (
            <div
              key={cat.title}
              className="rounded-2xl border border-border/60 bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-lg font-semibold">{cat.title}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* City Multipliers */}
      <section className="mt-16 space-y-8">
        <h2 className="text-2xl font-bold">{t.method.cityMultTitle}</h2>
        <p className="text-muted">{t.method.cityMultDesc}</p>
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface">
                <th className="px-6 py-3 text-left font-semibold">
                  {t.method.tableLevel}
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  {t.method.tableMultiplier}
                </th>
                <th className="px-6 py-3 text-left font-semibold">
                  {t.method.tableDesc}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.method.multipliers.map((m, i) => (
                <tr
                  key={m.level}
                  className={
                    i < t.method.multipliers.length - 1
                      ? "border-b border-border/40"
                      : ""
                  }
                >
                  <td className="px-6 py-3 font-medium">{m.level}</td>
                  <td className="px-6 py-3 font-mono text-primary">
                    {m.factor}
                  </td>
                  <td className="px-6 py-3 text-muted">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dog Size */}
      <section className="mt-16 space-y-8">
        <h2 className="text-2xl font-bold">{t.method.dogSizeTitle}</h2>
        <p className="text-muted">{t.method.dogSizeDesc}</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {t.method.sizeLabels.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-surface p-4 text-center"
            >
              <p className="font-semibold">{s.label}</p>
              <p className="mt-1 text-xs text-muted">{s.range}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="mt-16 space-y-4">
        <h2 className="text-2xl font-bold">{t.method.limitationsTitle}</h2>
        <div className="rounded-2xl border border-accent/30 bg-accent-light/30 p-6 text-sm leading-relaxed text-foreground/80">
          <ul className="space-y-3">
            {t.method.limitations.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Last Updated */}
      <section className="mt-16 border-t border-border pt-8">
        <p className="text-sm text-muted">{t.method.lastUpdated}</p>
      </section>
    </main>
  );
}
