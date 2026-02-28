"use client";

import { useState } from "react";

/* 青绿 → 青 → 蓝 → 靛蓝 → 深紫 → 灰 */
const COLORS: Record<string, string> = {
  Food: "#0d9488",
  "Preventive Meds": "#06b6d4",
  Treats: "#0ea5e9",
  Grooming: "#6366f1",
  "Toys & Supplies": "#6d28d9",
  Insurance: "#64748b",
};

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeDonutArc(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startDeg: number,
  endDeg: number
) {
  const start = polarToCartesian(cx, cy, rOuter, startDeg);
  const end = polarToCartesian(cx, cy, rOuter, endDeg);
  const startInner = polarToCartesian(cx, cy, rInner, startDeg);
  const endInner = polarToCartesian(cx, cy, rInner, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${end.x} ${end.y} L ${endInner.x} ${endInner.y} A ${rInner} ${rInner} 0 ${large} 0 ${startInner.x} ${startInner.y} Z`;
}

interface Slice {
  label: string;
  value: number;
}

export function PieChart({
  items,
  total,
  selected,
  onSelect,
  size = 160,
  showLabels = false,
  showSliceLabels = false,
  labelMap,
}: {
  items: Slice[];
  total: number;
  selected: string | null;
  onSelect: (label: string) => void;
  size?: number;
  showLabels?: boolean;
  showSliceLabels?: boolean;
  labelMap?: Record<string, string>;
}) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 2;
  const rInner = size / 2 * 0.55;
  const gap = 1.5;

  const n = items.length;
  const totalGap = n > 1 ? (n - 1) * gap : 0;
  let acc = 0;
  const slices = items.map((item, i) => {
    const pct = total > 0 ? item.value / total : 0;
    const span = Math.max(2, pct * (360 - totalGap));
    const startDeg = acc + (i > 0 ? gap : 0);
    acc = startDeg + span;
    return {
      ...item,
      startDeg,
      endDeg: startDeg + span,
      pct,
      color: COLORS[item.label] ?? "#64748b",
    };
  });

  return (
    <div className="relative inline-flex">
      <svg
        width={size}
        height={size}
        className="overflow-visible"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          {slices.map((s, i) => (
            <linearGradient
              key={s.label}
              id={`pie-grad-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={1} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.75} />
            </linearGradient>
          ))}
          <filter id="pie-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {slices.map((s, i) => {
          const isSelected = selected === s.label;
          const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r},${g},${b}`;
          };
          return (
            <path
              key={s.label}
              onMouseEnter={() => setHoveredLabel(s.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              d={describeDonutArc(
                cx,
                cy,
                rOuter,
                rInner,
                s.startDeg,
                s.endDeg
              )}
              fill={`url(#pie-grad-${i})`}
              stroke={
                isSelected
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.12)"
              }
              strokeWidth={isSelected ? 2.5 : 0.5}
              style={
                isSelected
                  ? {
                      filter: `drop-shadow(0 0 10px rgba(${hexToRgb(s.color)},0.5))`,
                    }
                  : undefined
              }
              className="cursor-pointer transition-all duration-200 hover:brightness-110"
              onClick={() => onSelect(s.label)}
            />
          );
        })}
        {showSliceLabels &&
          slices.map((s) => {
            const midDeg = (s.startDeg + s.endDeg) / 2;
            const labelR = (rInner + rOuter) / 2;
            const pos = polarToCartesian(cx, cy, labelR, midDeg);
            const displayLabel = (labelMap && labelMap[s.label]) || s.label;
            const isHovered = hoveredLabel === s.label;
            const shortLabel =
              displayLabel.length > 14
                ? displayLabel.slice(0, 12) + "…"
                : displayLabel;
            const labelText = isHovered ? displayLabel : shortLabel;
            const fontSize = Math.max(9, Math.min(12, size / 18));
            return (
              <text
                key={`label-${s.label}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
                className="select-none fill-white font-medium"
                style={{
                  fontSize: `${fontSize}px`,
                  textShadow:
                    "0 0 2px #000, 0 0 4px #000, 0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {labelText}
              </text>
            );
          })}
      </svg>
      {showLabels && total > 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-medium uppercase tracking-wider text-muted/70 ${size >= 300 ? "text-xs" : "text-[10px]"}`}>
            Total
          </span>
          <span className={`font-mono font-semibold tabular-nums text-foreground ${size >= 300 ? "text-xl" : "text-lg"}`}>
            ${total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
