"use client";

import { PieChart } from "./pie-chart";

const fmt = (n: number) => n.toLocaleString("en-US");

interface MonthlyItem {
  label: string;
  value: number;
}

export function CostDetailView({
  items,
  total,
  selected,
  onSelect,
  onClose,
  onSwitch,
  L,
  t,
  detailContent,
}: {
  items: MonthlyItem[];
  total: number;
  selected: string;
  onSelect: (label: string) => void;
  onClose: () => void;
  onSwitch: (label: string) => void;
  L: Record<string, string>;
  t: ReturnType<typeof import("@/app/i18n/context").useT>;
  detailContent: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <button
          onClick={onClose}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t.calc.costDetailBack}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Left: Pie chart */}
        <div className="flex shrink-0 flex-col items-center justify-center border-b border-border/60 p-5 lg:w-[42%] lg:border-b-0 lg:border-r lg:pr-6">
          <PieChart
            items={items}
            total={total}
            selected={selected}
            onSelect={onSelect}
            size={360}
            showLabels
            showSliceLabels
            labelMap={L}
          />
          <p className="mt-3 text-center text-xs text-muted">
            {t.calc.costDetailHint}
          </p>
          {/* Category tabs */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => onSwitch(item.label)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selected === item.label
                    ? "bg-primary text-white"
                    : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                }`}
              >
                {L[item.label] ?? item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:pl-6 lg:pr-8 lg:py-6">
          <div className="mx-auto max-w-lg">
            <h2 className="text-xl font-semibold">
              {L[selected] ?? selected}
            </h2>
            <p className="mt-1 text-sm text-muted">
              ${fmt(items.find((i) => i.label === selected)?.value ?? 0)}{" "}
              {t.calc.perMoShort}
            </p>
            <div className="mt-4">{detailContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
