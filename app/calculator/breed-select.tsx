"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage, useT } from "@/app/i18n/context";
import { useFullScreen } from "@/app/fullscreen-context";
import { useWeightUnit } from "@/app/weight-unit-context";
import {
  BREEDS,
  breedToSize,
  breedAvgWeight,
  type Breed,
  type DogSize,
} from "./breeds";

const SIZE_STYLES: Record<DogSize, string> = {
  small: "border-white/30 bg-white/10 text-white/90",
  medium: "border-white/30 bg-white/10 text-white/90",
  large: "border-white/30 bg-white/10 text-white/90",
  giant: "border-white/30 bg-white/10 text-white/90",
};

export default function BreedSelect({
  onSelect,
  onSkip,
}: {
  onSelect: (breed: Breed) => void;
  onSkip: () => void;
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [dogImages, setDogImages] = useState<string[]>([]);
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dog-images")
      .then((r) => r.json())
      .then((data: { images?: string[] }) => {
        const imgs = data.images ?? [];
        setDogImages(imgs);
        if (imgs.length > 0) {
          setBgImage(
            `/api/dog-image?name=${encodeURIComponent(imgs[Math.floor(Math.random() * imgs.length)])}`
          );
        }
      })
      .catch(() => setDogImages([]));
  }, []);

  const { lang } = useLanguage();
  const { setIsFullScreen } = useFullScreen();
  const { display, suffix } = useWeightUnit();
  const t = useT();
  const bt = t.calc.breed;

  useEffect(() => {
    setIsFullScreen(true);
    return () => setIsFullScreen(false);
  }, [setIsFullScreen]);

  const filtered = BREEDS.filter((b) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return b.nameEn.toLowerCase().includes(q) || b.nameZh.includes(q);
  });

  return (
    <main className="relative min-h-screen">
      {/* Full-viewport dog image background (fixed, behind navbar) */}
      <div className="fixed inset-0 -z-10">
        {bgImage ? (
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-primary" />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-primary/75" />
      </div>
      <div className="relative z-10 mx-auto max-w-xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {bt.title}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            {bt.subtitle}
          </p>
        </div>

        {/* Collapsible breed selection */}
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
          >
            <span className="text-sm font-medium text-white">
              {bt.searchPlaceholder}
            </span>
            <svg
              className={`h-5 w-5 shrink-0 text-white/70 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-white/10 px-4 pb-4 pt-3">
                {/* Search */}
                <div className="relative mb-4">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx={11} cy={11} r={8} />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder={bt.searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
                  />
                </div>

                {/* Breed list */}
                <div className="max-h-[320px] overflow-y-auto rounded-lg border border-white/10">
                  {filtered.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-white/50">
                      {bt.noResults}
                    </div>
                  )}
                  {filtered.map((breed, i) => {
                    const sz = breedToSize(breed);
                    const avg = breedAvgWeight(breed);
                    const sizeLabel = t.calc.sizes[sz].label;
                    return (
                      <button
                        key={breed.nameEn}
                        onClick={() => onSelect(breed)}
                        className={`group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-white/10 ${
                          i < filtered.length - 1
                            ? "border-b border-white/10"
                            : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {lang === "en" ? breed.nameEn : breed.nameZh}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            {lang === "en" ? breed.nameZh : breed.nameEn}
                            <span className="mx-1.5">·</span>
                            <span className="tabular-nums">
                              ~{display(avg).toFixed(suffix === "kg" ? 1 : 0)}{" "}
                              {suffix}
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="font-mono text-[11px] tabular-nums text-white/50">
                            {display(breed.weightMin).toFixed(
                              suffix === "kg" ? 1 : 0
                            )}
                            –
                            {display(breed.weightMax).toFixed(
                              suffix === "kg" ? 1 : 0
                            )}{" "}
                            {suffix}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-medium ${SIZE_STYLES[sz]}`}
                          >
                            {sizeLabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skip — text only, larger, bold */}
        <div className="mt-10 text-center">
          <button
            onClick={onSkip}
            className="text-base font-semibold text-white/90 transition-colors hover:text-white"
          >
            {bt.skip} →
          </button>
          <p className="mt-2 text-xs text-white/50">{bt.skipDesc}</p>
        </div>
      </div>
    </main>
  );
}
