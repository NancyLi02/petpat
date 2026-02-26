"use client";

import { useState } from "react";
import { useT } from "@/app/i18n/context";

/** Count chars: CJK = 2 units, others = 1. Max 100 = 100 English or 50 Chinese. */
function countSummaryUnits(s: string): number {
  let n = 0;
  for (const c of s) {
    n += /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(c) ? 2 : 1;
  }
  return n;
}
/** Max 100 units: 100 English or 30 Chinese (CJK=2) */
const SUMMARY_MAX = 100;

export default function MethodPage() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const summaryUnits = countSummaryUnits(summary);
  const summaryOverLimit = summaryUnits > SUMMARY_MAX;

  const handleSummaryChange = (v: string) => {
    let result = "";
    for (const c of v) {
      if (countSummaryUnits(result + c) <= SUMMARY_MAX) result += c;
      else break;
    }
    setSummary(result);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !summary.trim() || !feedback.trim())
      return;
    if (summaryOverLimit) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          summary: summary.trim(),
          message: feedback.trim(),
        }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSummary("");
        setFeedback("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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

      {/* Feedback */}
      <section className="mt-16 rounded-2xl border border-border/60 bg-surface p-6">
        <h2 className="text-xl font-bold">{t.method.feedbackTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.method.feedbackDesc}</p>
        <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted">
              {t.method.feedbackName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "sending"}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">
              {t.method.feedbackEmail}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "sending"}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">
              {t.method.feedbackSummary}
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder={t.method.feedbackSummaryPlaceholder}
              disabled={status === "sending"}
              className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-primary disabled:opacity-60 ${
                summaryOverLimit ? "border-red-500" : "border-border"
              }`}
            />
            <p className="mt-1 text-xs text-muted">
              {t.method.feedbackSummaryLimit} · {summaryUnits}/{SUMMARY_MAX}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted">
              {t.method.feedbackBody}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t.method.feedbackBodyPlaceholder}
              rows={4}
              disabled={status === "sending"}
              className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-primary disabled:opacity-60"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={
                status === "sending" ||
                !name.trim() ||
                !email.trim() ||
                !summary.trim() ||
                !feedback.trim() ||
                summaryOverLimit
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {status === "sending"
                ? t.method.feedbackSending
                : t.method.feedbackSend}
            </button>
            {status === "success" && (
              <span className="text-sm text-green-600">
                {t.method.feedbackSuccess}
              </span>
            )}
            {status === "error" && (
              <span className="text-sm text-red-600">
                {t.method.feedbackError}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Last Updated */}
      <section className="mt-16 border-t border-border pt-8">
        <p className="text-sm text-muted">{t.method.lastUpdated}</p>
      </section>
    </main>
  );
}
