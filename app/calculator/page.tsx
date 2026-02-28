"use client";

import { useState, useMemo } from "react";
import { useT, useLanguage } from "@/app/i18n/context";
import { useWeightUnit } from "@/app/weight-unit-context";
import { breedToSize, breedAvgWeight, type Breed, type DogSize } from "./breeds";
import BreedSelect from "./breed-select";
import { PieChart } from "./pie-chart";
import { CostDetailView } from "./cost-detail-view";

/* ───────── types ───────── */

type CostLevel = "low" | "average" | "high" | "veryHigh";
type Acquisition = "adopt" | "buy";

/* ───────── constants ───────── */

const DOG_SIZE_KEYS: { key: DogSize; icon: string; defaultLbs: number }[] = [
  { key: "small", icon: "🐕", defaultLbs: 10 },
  { key: "medium", icon: "🦮", defaultLbs: 35 },
  { key: "large", icon: "🐕‍🦺", defaultLbs: 75 },
  { key: "giant", icon: "🐾", defaultLbs: 120 },
];

const COST_LEVEL_KEYS: { key: CostLevel; icon: string }[] = [
  { key: "low", icon: "🏡" },
  { key: "average", icon: "🏘️" },
  { key: "high", icon: "🏙️" },
  { key: "veryHigh", icon: "🌆" },
];

const CITY_MULT: Record<CostLevel, number> = {
  low: 0.8,
  average: 1.0,
  high: 1.15,
  veryHigh: 1.35,
};

type BySize = Record<DogSize, number>;

const ACTIVITY_KEYS = ["inactive", "neutered", "intact", "active"] as const;
const ACTIVITY_FACTORS: Record<string, number> = {
  inactive: 1.0,
  neutered: 1.6,
  intact: 1.8,
  active: 2.0,
};

const FOOD_TIER_KEYS = ["budget", "midRange", "premium", "ultra"] as const;
const FOOD_TIER_PRICES: Record<string, number> = {
  budget: 1.5,
  midRange: 2.5,
  premium: 3.5,
  ultra: 5.0,
};

const LBS_TO_KG = 0.453592;
const FOOD_KCAL_PER_KG = 3600;
const DAYS_PER_MONTH = 30.44;

const COSTS = {
  initial: {
    adopt: { small: 150, medium: 250, large: 300, giant: 350 } as BySize,
    buy: { small: 1500, medium: 1200, large: 1000, giant: 1500 } as BySize,
    spayNeuter: { small: 200, medium: 300, large: 400, giant: 500 } as BySize,
    vetVisit: 200,
    microchip: 50,
    crate: { small: 35, medium: 55, large: 80, giant: 100 } as BySize,
    bed: { small: 30, medium: 45, large: 65, giant: 85 } as BySize,
    leashCollar: 40,
    bowls: 20,
    toys: 30,
  },
  monthly: {
    treats: { small: 10, medium: 15, large: 20, giant: 25 } as BySize,
    preventive: { small: 25, medium: 30, large: 35, giant: 40 } as BySize,
    grooming: { small: 40, medium: 55, large: 70, giant: 85 } as BySize,
    toysSupplies: 15,
    wasteBags: 10,
  },
  annual: {
    vetVisit: 250,
    vaccines: 100,
    dental: 300,
    license: 20,
  },
  optional: {
    insurance: { small: 35, medium: 45, large: 55, giant: 65 } as BySize,
    training: 200,
  },
};

/* ───────── insurance premium model (NAPHIA 2024 base, multiplicative factors) ───────── */
const INSURANCE_BASE_MO = 62.44; // USD/mo, dog A&I (Accident + Illness)

const AGE_FACTORS: { maxAge: number; factor: number }[] = [
  { maxAge: 1, factor: 0.8 },
  { maxAge: 5, factor: 1.0 },
  { maxAge: 8, factor: 1.4 },
  { maxAge: 11, factor: 1.9 },
  { maxAge: 999, factor: 2.5 },
];

const BREED_FACTORS: Record<DogSize, number> = {
  small: 0.95,
  medium: 1.0,
  large: 1.1,
  giant: 1.2,
};

const HIGH_RISK_BREED_FACTOR = 1.25; // brachycephalic, IVDD-prone, etc.

const REGION_FACTORS: Record<CostLevel, number> = {
  low: 0.9,
  average: 1.0,
  high: 1.2,
  veryHigh: 1.3,
};

const REIMBURSEMENT_OPTIONS = [
  { key: "70", pct: 70, factor: 0.9 },
  { key: "80", pct: 80, factor: 1.0 },
  { key: "90", pct: 90, factor: 1.15 },
] as const;

const DEDUCTIBLE_OPTIONS = [
  { key: "750", val: 750, factor: 0.85 },
  { key: "500", val: 500, factor: 1.0 },
  { key: "250", val: 250, factor: 1.15 },
  { key: "100", val: 100, factor: 1.3 },
] as const;

const ANNUAL_LIMIT_OPTIONS = [
  { key: "5000", val: 5000, factor: 1.0 },
  { key: "10000", val: 10000, factor: 1.1 },
  { key: "unlimited", val: 0, factor: 1.35 },
] as const;

const HIGH_RISK_BREEDS = new Set([
  "French Bulldog",
  "English Bulldog",
  "Pug",
  "Dachshund",
  "Cavalier King Charles Spaniel",
  "Boxer",
  "Shih Tzu",
  "Pekingese",
  "Boston Terrier",
]);

function getAgeFactor(ageYears: number): number {
  for (const { maxAge, factor } of AGE_FACTORS) {
    if (ageYears <= maxAge) return factor;
  }
  return AGE_FACTORS[AGE_FACTORS.length - 1].factor;
}

function calcInsurancePremium(
  ageYears: number,
  size: DogSize,
  costLevel: CostLevel,
  isHighRiskBreed: boolean,
  reimbFactor: number,
  deductFactor: number,
  limitFactor: number,
): { estimate: number; low: number; high: number } {
  const ageF = getAgeFactor(ageYears);
  const breedF = BREED_FACTORS[size] * (isHighRiskBreed ? HIGH_RISK_BREED_FACTOR : 1);
  const regionF = REGION_FACTORS[costLevel];
  const planF = reimbFactor * deductFactor * limitFactor;
  const estimate =
    INSURANCE_BASE_MO * ageF * breedF * regionF * planF;
  const pctRange = 0.15;
  return {
    estimate: Math.round(estimate),
    low: Math.round(estimate * (1 - pctRange)),
    high: Math.round(estimate * (1 + pctRange)),
  };
}

/* ───────── food metabolic model ───────── */

interface FoodCalc {
  weightLbs: number;
  weightKg: number;
  weightKg075: number;
  rer: number;
  activityFactor: number;
  mer: number;
  dailyKg: number;
  dailyLbs: number;
  monthlyLbs: number;
  pricePerLb: number;
  monthlyCost: number;
}

function calcFood(
  weightLbs: number,
  activityFactor: number,
  pricePerLb: number,
): FoodCalc {
  const weightKg = weightLbs * LBS_TO_KG;
  const weightKg075 = Math.pow(weightKg, 0.75);
  const rer = 70 * weightKg075;
  const mer = rer * activityFactor;
  const dailyKg = mer / FOOD_KCAL_PER_KG;
  const dailyLbs = dailyKg / LBS_TO_KG;
  const monthlyLbs = dailyLbs * DAYS_PER_MONTH;
  const monthlyCost = monthlyLbs * pricePerLb;
  return {
    weightLbs,
    weightKg,
    weightKg075,
    rer,
    activityFactor,
    mer,
    dailyKg,
    dailyLbs,
    monthlyLbs,
    pricePerLb,
    monthlyCost,
  };
}

/* ───────── helpers ───────── */

const fmt = (n: number) => n.toLocaleString("en-US");
const fd = (n: number, d = 2) => n.toFixed(d);
const adj = (base: number, mult: number) => Math.round(base * mult);

const LEGEND_COLORS: Record<string, string> = {
  Food: "#0d9488",
  "Preventive Meds": "#06b6d4",
  Treats: "#0ea5e9",
  Grooming: "#6366f1",
  "Toys & Supplies": "#6d28d9",
  Insurance: "#64748b",
};

/* ═══════════════════ Calculator ═══════════════════ */

export default function Calculator() {
  const t = useT();
  const { lang } = useLanguage();
  const { unit, display, parseToLbs, suffix } = useWeightUnit();

  /* ── step & breed ── */
  const [step, setStep] = useState<"breed" | "calc">("breed");
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);

  /* ── core state ── */
  const [size, setSize] = useState<DogSize>("medium");
  const [costLevel, setCostLevel] = useState<CostLevel>("average");
  const [acquisition, setAcquisition] = useState<Acquisition>("adopt");
  const [insurance, setInsurance] = useState(false);
  const [training, setTraining] = useState(false);
  const [useTreats, setUseTreats] = useState(true);
  const [useGrooming, setUseGrooming] = useState(true);
  const [useToysSupplies, setUseToysSupplies] = useState(true);

  /* ── food detail state (stored in lbs for consistent calc across unit switch) ── */
  const [customWeightLbs, setCustomWeightLbs] = useState<number | null>(null);
  /* ── cost detail view (pie chart detail page) ── */
  const [costDetailView, setCostDetailView] = useState<string | null>(null);
  const [customOverrides, setCustomOverrides] = useState<Record<string, string>>(
    {}
  );
  const [activityKey, setActivityKey] = useState("neutered");
  const [foodTierKey, setFoodTierKey] = useState("midRange");
  const [customFoodPrice, setCustomFoodPrice] = useState("");

  /* ── insurance detail state ── */
  const [dogAgeYears, setDogAgeYears] = useState(4);
  const [insuranceReimbursement, setInsuranceReimbursement] =
    useState<"70" | "80" | "90">("80");
  const [insuranceDeductible, setInsuranceDeductible] =
    useState<"100" | "250" | "500" | "750">("500");
  const [insuranceAnnualLimit, setInsuranceAnnualLimit] =
    useState<"5000" | "10000" | "unlimited">("5000");

  const handleSizeChange = (s: DogSize) => {
    setSize(s);
    setCustomWeightLbs(null);
  };

  /* ── food computation ── */
  const defaultWeight =
    DOG_SIZE_KEYS.find((d) => d.key === size)!.defaultLbs;
  const effectiveWeight =
    customWeightLbs != null
      ? Math.max(1, customWeightLbs)
      : defaultWeight;
  const activityFactor = ACTIVITY_FACTORS[activityKey] ?? 1.6;
  const tierPrice = FOOD_TIER_PRICES[foodTierKey] ?? 2.5;
  const effectiveFoodPrice = customFoodPrice
    ? Math.max(0.01, parseFloat(customFoodPrice) || tierPrice)
    : tierPrice;

  const foodCalc = useMemo(
    () => calcFood(effectiveWeight, activityFactor, effectiveFoodPrice),
    [effectiveWeight, activityFactor, effectiveFoodPrice],
  );

  const handleFoodTier = (key: string) => {
    setFoodTierKey(key);
    setCustomFoodPrice("");
  };

  /* ── label map (translate internal keys → display) ── */
  const L: Record<string, string> = {
    Food: t.calc.food,
    Treats: t.calc.treats,
    "Preventive Meds": t.calc.preventiveMeds,
    Grooming: t.calc.grooming,
    "Toys & Supplies": t.calc.toysSupplies,
    "Waste Bags": t.calc.wasteBags,
    Insurance: t.calc.insuranceItem,
    "Vet Wellness Visit": t.calc.vetVisit,
    "Vaccines & Boosters": t.calc.vaccines,
    "Dental Cleaning": t.calc.dentalCleaning,
    "License / Registration": t.calc.license,
    "Adoption Fee": t.calc.adoptionFee,
    "Purchase Price": t.calc.purchasePrice,
    "Spay / Neuter": t.calc.spayNeuter,
    "First Vet Visit": t.calc.firstVetVisit,
    Microchip: t.calc.microchip,
    "Starter Supplies": t.calc.starterSupplies,
    "Training Classes": t.calc.trainingClasses,
  };

  /* ── overall costs ── */
  const cityMult = CITY_MULT[costLevel];

  const isHighRiskBreed = selectedBreed
    ? HIGH_RISK_BREEDS.has(selectedBreed.nameEn)
    : false;

  const insurancePremium = useMemo(() => {
    const reimb = REIMBURSEMENT_OPTIONS.find((o) => o.key === insuranceReimbursement);
    const deduct = DEDUCTIBLE_OPTIONS.find((o) => o.key === insuranceDeductible);
    const limit = ANNUAL_LIMIT_OPTIONS.find((o) => o.key === insuranceAnnualLimit);
    return calcInsurancePremium(
      dogAgeYears,
      size,
      costLevel,
      isHighRiskBreed,
      reimb?.factor ?? 1,
      deduct?.factor ?? 1,
      limit?.factor ?? 1,
    );
  }, [
    dogAgeYears,
    size,
    costLevel,
    isHighRiskBreed,
    insuranceReimbursement,
    insuranceDeductible,
    insuranceAnnualLimit,
  ]);

  const costs = useMemo(() => {
    const m = cityMult;
    const food = Math.round(foodCalc.monthlyCost * m);

    const acqCost = adj(
      acquisition === "adopt"
        ? COSTS.initial.adopt[size]
        : COSTS.initial.buy[size],
      m,
    );
    const spayNeuter = adj(COSTS.initial.spayNeuter[size], m);
    const initVet = adj(COSTS.initial.vetVisit, m);
    const microchip = adj(COSTS.initial.microchip, m);
    const supplies =
      adj(COSTS.initial.crate[size], m) +
      adj(COSTS.initial.bed[size], m) +
      adj(COSTS.initial.leashCollar, m) +
      adj(COSTS.initial.bowls, m) +
      adj(COSTS.initial.toys, m);
    const totalInitial = acqCost + spayNeuter + initVet + microchip + supplies;

    const treats = adj(COSTS.monthly.treats[size], m);
    const preventive = adj(COSTS.monthly.preventive[size], m);
    const grooming = adj(COSTS.monthly.grooming[size], m);
    const toysSupplies = adj(COSTS.monthly.toysSupplies, m);
    const wasteBags = adj(COSTS.monthly.wasteBags, m);
    const toysSuppliesWithWaste = toysSupplies + wasteBags;
    const insuranceMo = insurance ? insurancePremium.estimate : 0;
    const insuranceBase = insurancePremium.estimate;
    const baseItems: { label: string; value: number }[] = [
      { label: "Food", value: food },
      { label: "Preventive Meds", value: preventive },
      ...(useTreats ? [{ label: "Treats", value: treats }] : []),
      ...(useGrooming ? [{ label: "Grooming", value: grooming }] : []),
      ...(useToysSupplies
        ? [{ label: "Toys & Supplies", value: toysSuppliesWithWaste }]
        : []),
      ...(insurance ? [{ label: "Insurance", value: insuranceMo }] : []),
    ];

    const baseItemsAll: { label: string; value: number }[] = [
      { label: "Food", value: food },
      { label: "Preventive Meds", value: preventive },
      { label: "Treats", value: treats },
      { label: "Grooming", value: grooming },
      { label: "Toys & Supplies", value: toysSuppliesWithWaste },
      { label: "Insurance", value: insuranceBase },
    ];

    const applyOverride = (label: string, base: number) => {
      const v = customOverrides[label];
      if (v === undefined || v === "") return base;
      const n = parseFloat(v);
      return isNaN(n) ? base : Math.round(n);
    };

    const monthlyItems = baseItems.map((item) => ({
      ...item,
      value: applyOverride(item.label, item.value),
    }));

    const monthlyItemsAll = baseItemsAll.map((item) => ({
      ...item,
      value: applyOverride(item.label, item.value),
    }));

    const totalMonthly = monthlyItems.reduce((s, i) => s + i.value, 0);
    const totalMonthlyAll = monthlyItemsAll.reduce((s, i) => s + i.value, 0);

    const vetVisit = adj(COSTS.annual.vetVisit, m);
    const vaccines = adj(COSTS.annual.vaccines, m);
    const dental = adj(COSTS.annual.dental, m);
    const license = adj(COSTS.annual.license, m);
    const trainingCost = training ? adj(COSTS.optional.training, m) : 0;
    const totalAnnualFixed = vetVisit + vaccines + dental + license;

    const annualItems = [
      { label: "Vet Wellness Visit", value: vetVisit },
      { label: "Vaccines & Boosters", value: vaccines },
      { label: "Dental Cleaning", value: dental },
      { label: "License / Registration", value: license },
    ];

    const annualTotal = totalMonthly * 12 + totalAnnualFixed;
    const firstYear = annualTotal + totalInitial + trainingCost;

    return {
      initial: {
        items: [
          {
            label:
              acquisition === "adopt" ? "Adoption Fee" : "Purchase Price",
            value: acqCost,
          },
          { label: "Spay / Neuter", value: spayNeuter },
          { label: "First Vet Visit", value: initVet },
          { label: "Microchip", value: microchip },
          { label: "Starter Supplies", value: supplies },
          ...(training
            ? [{ label: "Training Classes", value: trainingCost }]
            : []),
        ],
        total: totalInitial + trainingCost,
      },
      monthly: {
        items: monthlyItems,
        total: totalMonthly,
        itemsAll: monthlyItemsAll,
        totalAll: totalMonthlyAll,
      },
      annual: { items: annualItems, total: totalAnnualFixed },
      summary: { monthly: totalMonthly, annual: annualTotal, firstYear },
      lifetime: {
        year5: firstYear + annualTotal * 4,
        year10: firstYear + annualTotal * 9,
        year15: firstYear + annualTotal * 14,
      },
    };
  }, [
    size,
    cityMult,
    acquisition,
    insurance,
    insurancePremium,
    training,
    useTreats,
    useGrooming,
    useToysSupplies,
    foodCalc.monthlyCost,
    customOverrides,
  ]);

  /* ── breed handlers ── */
  const handleBreedSelect = (breed: Breed) => {
    setSelectedBreed(breed);
    setSize(breedToSize(breed));
    setCustomWeightLbs(breedAvgWeight(breed));
    setStep("calc");
  };

  const handleSkip = () => {
    setSelectedBreed(null);
    setStep("calc");
  };

  /* ════════ render ════════ */

  if (step === "breed") {
    return <BreedSelect onSelect={handleBreedSelect} onSkip={handleSkip} />;
  }

  const OPTIONAL_LABELS = [
    "Treats",
    "Grooming",
    "Toys & Supplies",
    "Insurance",
  ] as const;

  /* Cost detail view (pie chart detail page) */
  const selectedDetail =
    costDetailView &&
    (costs.monthly.items.some((i) => i.label === costDetailView) ||
      OPTIONAL_LABELS.includes(
        costDetailView as (typeof OPTIONAL_LABELS)[number],
      ))
      ? costDetailView
      : null;

  const detailItems = selectedDetail
    ? costs.monthly.items.some((i) => i.label === selectedDetail)
      ? costs.monthly.items
      : costs.monthly.itemsAll
    : [];
  const detailTotal =
    selectedDetail &&
    costs.monthly.items.some((i) => i.label === selectedDetail)
      ? costs.monthly.total
      : costs.monthly.totalAll;

  const detailContent =
    selectedDetail === "Food" ? (
      <FoodDetail
        t={t}
        calc={foodCalc}
        defaultWeight={defaultWeight}
        customWeightLbs={customWeightLbs}
        onWeightChange={(val) => {
          if (val.trim() === "") setCustomWeightLbs(null);
          else {
            const lbs = parseToLbs(val);
            if (lbs > 0) setCustomWeightLbs(lbs);
          }
        }}
        activityKey={activityKey}
        onActivityChange={setActivityKey}
        foodTierKey={foodTierKey}
        onFoodTierChange={handleFoodTier}
        customFoodPrice={customFoodPrice}
        onPriceChange={setCustomFoodPrice}
        customAmount={customOverrides.Food ?? ""}
        onCustomAmountChange={(v) =>
          setCustomOverrides((o) => ({ ...o, Food: v }))
        }
        cityMult={cityMult}
        adjustedCost={Math.round(foodCalc.monthlyCost * cityMult)}
        weightUnit={unit}
        displayWeight={display}
        weightSuffix={suffix}
      />
    ) : selectedDetail === "Insurance" ? (
      <InsuranceDetail
        t={t}
        lang={lang}
        premium={insurancePremium}
        customAmount={customOverrides.Insurance ?? ""}
        onCustomAmountChange={(v) =>
          setCustomOverrides((o) => ({ ...o, Insurance: v }))
        }
        dogAgeYears={dogAgeYears}
        onAgeChange={setDogAgeYears}
        size={size}
        costLevel={costLevel}
        isHighRiskBreed={isHighRiskBreed}
        selectedBreed={selectedBreed}
        insuranceReimbursement={insuranceReimbursement}
        onReimbursementChange={setInsuranceReimbursement}
        insuranceDeductible={insuranceDeductible}
        onDeductibleChange={setInsuranceDeductible}
        insuranceAnnualLimit={insuranceAnnualLimit}
        onAnnualLimitChange={setInsuranceAnnualLimit}
      />
    ) : selectedDetail ? (
      <div className="rounded-xl border border-border/60 bg-surface/60 p-6">
        <p className="text-base text-muted">{t.calc.simpleDetailDesc}</p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-muted">
            {t.calc.customAmount}
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted">$</span>
            <input
              type="number"
              placeholder={String(
                detailItems.find((i) => i.label === selectedDetail)?.value ?? 0
              )}
              value={customOverrides[selectedDetail] ?? ""}
              onChange={(e) =>
                setCustomOverrides((o) => ({
                  ...o,
                  [selectedDetail]: e.target.value,
                }))
              }
              className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
            />
            <span className="text-xs text-muted">{t.calc.perMoShort}</span>
          </div>
        </div>
      </div>
    ) : null;

  if (selectedDetail) {
    return (
      <CostDetailView
        items={detailItems}
        total={detailTotal}
        selected={selectedDetail}
        onSelect={setCostDetailView}
        onClose={() => setCostDetailView(null)}
        onSwitch={setCostDetailView}
        L={L}
        t={t}
        detailContent={detailContent}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Header */}
      <header className="mb-12 text-center">
        <button
          onClick={() => setStep("breed")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          ← {t.calc.breed.changeBreed}
        </button>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t.calc.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t.calc.subtitle}</p>
        {selectedBreed && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            🐕{" "}
            {lang === "en" ? selectedBreed.nameEn : selectedBreed.nameZh}
            <span className="text-primary/40">·</span>
            <span className="tabular-nums">
              {display(selectedBreed.weightMin).toFixed(
                suffix === "kg" ? 1 : 0
              )}
              –
              {display(selectedBreed.weightMax).toFixed(
                suffix === "kg" ? 1 : 0
              )}{" "}
              {suffix}
            </span>
          </div>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-10">
        {/* ── Left: Inputs ── */}
        <aside className="mb-10 space-y-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          {/* Dog Size */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              {t.calc.dogSize}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {DOG_SIZE_KEYS.map((d) => {
                const s = t.calc.sizes[d.key];
                return (
                  <button
                    key={d.key}
                    onClick={() => handleSizeChange(d.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                      size === d.key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 bg-surface hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{d.icon}</span>
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="text-[11px] text-muted">
                      {unit === "lb" ? s.weight : s.weightKg}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* City Cost Level */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              {t.calc.cityLevel}
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {COST_LEVEL_KEYS.map((c) => {
                const lv = t.calc.levels[c.key];
                return (
                  <button
                    key={c.key}
                    onClick={() => setCostLevel(c.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                      costLevel === c.key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 bg-surface hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-sm font-semibold">{lv.label}</span>
                    <span className="text-[11px] text-muted">{lv.desc}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Acquisition */}
          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              {t.calc.gettingDog}
            </legend>
            <div className="flex gap-3">
              {(["adopt", "buy"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAcquisition(opt)}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                    acquisition === opt
                      ? "border-primary bg-primary/5"
                      : "border-border/60 bg-surface hover:border-primary/30"
                  }`}
                >
                  {opt === "adopt" ? t.calc.adopt : t.calc.purchase}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Toggles */}
          <div className="space-y-4">
            <Toggle
              label={t.calc.trainingLabel}
              desc={t.calc.trainingDesc}
              checked={training}
              onChange={setTraining}
            />
          </div>
        </aside>

        {/* ── Right: Results ── */}
        <section className="space-y-6">
          {/* Summary Card */}
          <div className="overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-xl shadow-primary/15">
            <p className="text-sm font-medium uppercase tracking-wider text-white/70">
              {t.calc.firstYearCost}
            </p>
            <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight">
              ${fmt(costs.summary.firstYear)}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
              <div>
                <p className="text-sm text-white/60">{t.calc.monthlyAvg}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  ${fmt(costs.summary.monthly)}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/60">{t.calc.annualAfter}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  ${fmt(costs.summary.annual)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown — Pie chart */}
          <SectionCard
            title={t.calc.monthlyTitle}
            total={costs.monthly.total}
            suffix={t.calc.perMo}
          >
            {/* Optional items toggles */}
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Toggle
                label={t.calc.treatsLabel}
                desc={t.calc.treatsDesc}
                checked={useTreats}
                onChange={setUseTreats}
                onLabelClick={() => setCostDetailView("Treats")}
              />
              <Toggle
                label={t.calc.groomingLabel}
                desc={t.calc.groomingDesc}
                checked={useGrooming}
                onChange={setUseGrooming}
                onLabelClick={() => setCostDetailView("Grooming")}
              />
              <Toggle
                label={t.calc.toysSuppliesLabel}
                desc={t.calc.toysSuppliesDesc}
                checked={useToysSupplies}
                onChange={setUseToysSupplies}
                onLabelClick={() => setCostDetailView("Toys & Supplies")}
              />
              <Toggle
                label={t.calc.insuranceLabel}
                desc={t.calc.insuranceDesc}
                checked={insurance}
                onChange={setInsurance}
                onLabelClick={() => setCostDetailView("Insurance")}
              />
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <PieChart
                items={costs.monthly.items}
                total={costs.monthly.total}
                selected={null}
                onSelect={(label) => setCostDetailView(label)}
                size={240}
                showLabels
                showSliceLabels
                labelMap={L}
              />
              <div className="flex flex-wrap gap-2 sm:flex-col">
                {costs.monthly.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setCostDetailView(item.label)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-foreground/[.04]"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: LEGEND_COLORS[item.label] ?? "#9ca3af",
                      }}
                    />
                    <span className="text-sm text-muted">
                      {L[item.label] ?? item.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      ${fmt(item.value)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              {t.calc.costDetailHint}
            </p>
          </SectionCard>

          {/* Annual Fixed Costs */}
          <SectionCard
            title={t.calc.annualTitle}
            total={costs.annual.total}
            suffix={t.calc.perYr}
          >
            <div className="divide-y divide-border/40">
              {costs.annual.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-muted">
                    {L[item.label] ?? item.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    ${fmt(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Initial Setup Costs */}
          <SectionCard
            title={t.calc.setupTitle}
            total={costs.initial.total}
            suffix={t.calc.oneTime}
          >
            <div className="divide-y divide-border/40">
              {costs.initial.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-muted">
                    {L[item.label] ?? item.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    ${fmt(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Lifetime Projection */}
          <div className="rounded-2xl border border-border/60 bg-surface p-6">
            <h3 className="text-lg font-semibold">{t.calc.lifetimeTitle}</h3>
            <p className="mt-1 text-sm text-muted">{t.calc.lifetimeDesc}</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { yr: 5, val: costs.lifetime.year5 },
                { yr: 10, val: costs.lifetime.year10 },
                { yr: 15, val: costs.lifetime.year15 },
              ].map(({ yr, val }) => (
                <div
                  key={yr}
                  className="rounded-xl bg-background p-5 text-center"
                >
                  <p className="text-sm text-muted">
                    {yr} {t.calc.years}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-primary">
                    ${fmt(val)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted/70">
            {t.calc.disclaimerBefore}
            <a href="/method" className="underline hover:text-primary">
              {t.calc.disclaimerLink}
            </a>
            {t.calc.disclaimerAfter}
          </p>
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════ Insurance Detail Panel ═══════════════════ */

function InsuranceDetail({
  t,
  lang,
  premium,
  customAmount,
  onCustomAmountChange,
  dogAgeYears,
  onAgeChange,
  size,
  costLevel,
  isHighRiskBreed,
  selectedBreed,
  insuranceReimbursement,
  onReimbursementChange,
  insuranceDeductible,
  onDeductibleChange,
  insuranceAnnualLimit,
  onAnnualLimitChange,
}: {
  t: ReturnType<typeof useT>;
  lang: string;
  premium: { estimate: number; low: number; high: number };
  customAmount: string;
  onCustomAmountChange: (v: string) => void;
  dogAgeYears: number;
  onAgeChange: (v: number) => void;
  size: DogSize;
  costLevel: CostLevel;
  isHighRiskBreed: boolean;
  selectedBreed: Breed | null;
  insuranceReimbursement: "70" | "80" | "90";
  onReimbursementChange: (v: "70" | "80" | "90") => void;
  insuranceDeductible: "100" | "250" | "500" | "750";
  onDeductibleChange: (v: "100" | "250" | "500" | "750") => void;
  insuranceAnnualLimit: "5000" | "10000" | "unlimited";
  onAnnualLimitChange: (v: "5000" | "10000" | "unlimited") => void;
}) {
  const ins = t.calc.insuranceDetail;
  const sizeLabels = t.calc.sizes;
  const levelLabels = t.calc.levels;

  return (
    <div className="mb-3 mt-2 rounded-xl border border-border/60 bg-background p-5">
      <h4 className="text-base font-semibold">{ins.howTitle}</h4>
      <p className="mt-1 text-sm leading-relaxed text-muted">{ins.howDesc}</p>

      {/* Premium result — final amount used in budget */}
      {(() => {
        const hasCustom = customAmount && !isNaN(parseFloat(customAmount));
        const finalAmount = hasCustom
          ? Math.round(parseFloat(customAmount))
          : premium.estimate;
        return (
          <div className="mt-4 rounded-xl border-2 border-primary/30 bg-primary/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              {ins.finalLabel}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
              ${fmt(finalAmount)}
              <span className="ml-1 text-lg font-normal text-muted">/mo</span>
            </p>
            {ins.finalDesc && (
              <p className="mt-1 text-sm text-muted">{ins.finalDesc}</p>
            )}
            {!hasCustom && (
              <p className="mt-2 text-xs text-muted">
                {ins.rangeLabel}: ${fmt(premium.low)} – ${fmt(premium.high)}/mo
              </p>
            )}
          </div>
        );
      })()}

      {/* Customize */}
      <div className="mt-5 border-t border-border/40 pt-5">
        <h4 className="text-base font-semibold">{t.calc.foodDetail.customizeTitle}</h4>

        {/* Age */}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-muted">{ins.ageLabel}</span>
          {ins.ageHint && (
            <p className="mt-0.5 text-xs text-muted/90">{ins.ageHint}</p>
          )}
          <div className="mt-1">
            <input
              type="number"
              min={0}
              max={20}
              value={dogAgeYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 0 && v <= 20) onAgeChange(v);
              }}
              className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
            />
          </div>
        </label>

        {/* Breed / size (read-only summary) */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted">{ins.breedLabel}</span>
          <p className="mt-0.5 text-sm">
            {selectedBreed
              ? `${sizeLabels[size]?.label ?? size} · ${lang === "zh" ? selectedBreed.nameZh : selectedBreed.nameEn}`
              : sizeLabels[size]?.label ?? size}
            {isHighRiskBreed && (
              <span className="ml-1 text-xs text-amber-600">({ins.highRiskNote})</span>
            )}
          </p>
        </div>

        {/* Region (read-only, from calculator city selection) */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted">{ins.regionLabel}</span>
          {ins.regionHint && (
            <p className="mt-0.5 text-xs text-muted/90">{ins.regionHint}</p>
          )}
          <p className="mt-1 text-sm font-medium">
            {levelLabels[costLevel]?.label ?? costLevel}
          </p>
        </div>

        {/* Plan structure */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted">{ins.planLabel}</span>

          <div className="mt-2">
            <span className="block text-xs text-muted">{ins.reimbursementLabel}</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {REIMBURSEMENT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => onReimbursementChange(o.key)}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                    insuranceReimbursement === o.key
                      ? "bg-primary text-white"
                      : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                  }`}
                >
                  {o.pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <span className="block text-xs text-muted">{ins.deductibleLabel}</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {DEDUCTIBLE_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => onDeductibleChange(o.key)}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                    insuranceDeductible === o.key
                      ? "bg-primary text-white"
                      : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                  }`}
                >
                  ${o.val}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <span className="block text-xs text-muted">{ins.annualLimitLabel}</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {ANNUAL_LIMIT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => onAnnualLimitChange(o.key)}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                    insuranceAnnualLimit === o.key
                      ? "bg-primary text-white"
                      : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                  }`}
                >
                  {o.key === "unlimited" ? ins.unlimited : `$${fmt(o.val)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Get your own quote */}
        {ins.getQuoteTitle && ins.getQuoteDesc && (
          <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h5 className="text-sm font-semibold text-foreground">
              {ins.getQuoteTitle}
            </h5>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {ins.getQuoteDesc}
            </p>
            {ins.getQuoteCompanies && ins.getQuoteCompanies.length > 0 && (
              <ul className="mt-3 space-y-2">
                {ins.getQuoteCompanies.map(
                  (c: { name: string; url: string; features: string }, i: number) => (
                    <li key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline shrink-0"
                      >
                        {c.name}
                      </a>
                      <span className="text-xs text-muted/90">{c.features}</span>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        )}

        {/* Custom amount override — highlighted */}
        <div className="mt-5 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-foreground">
            {ins.customAmountLabel}
          </p>
          {ins.customAmountHint && (
            <p className="mt-0.5 text-xs text-muted">{ins.customAmountHint}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-base font-medium text-foreground">$</span>
            <input
              type="number"
              placeholder={String(premium.estimate)}
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              className="w-28 rounded-lg border-2 border-amber-500/50 bg-background px-4 py-2.5 text-base font-semibold tabular-nums outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <span className="text-sm font-medium text-muted">{t.calc.perMoShort}</span>
          </div>
          {customAmount && (
            <button
              type="button"
              onClick={() => onCustomAmountChange("")}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              {ins.customAmountClear}
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-muted/80">{ins.sourceNote}</p>

        {ins.references && ins.references.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted">{ins.referencesTitle}</p>
            <ul className="mt-1 space-y-0.5 text-xs text-muted/90">
              {ins.references.map((ref: { name: string; url: string }, i: number) => (
                <li key={i}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {ref.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════ Food Detail Panel ═══════════════════ */

function FoodDetail({
  t,
  calc,
  defaultWeight,
  customWeightLbs,
  onWeightChange,
  activityKey,
  onActivityChange,
  foodTierKey,
  onFoodTierChange,
  customFoodPrice,
  onPriceChange,
  customAmount,
  onCustomAmountChange,
  cityMult,
  adjustedCost,
  weightUnit,
  displayWeight,
  weightSuffix,
}: {
  t: ReturnType<typeof useT>;
  calc: FoodCalc;
  defaultWeight: number;
  customWeightLbs: number | null;
  onWeightChange: (v: string) => void;
  activityKey: string;
  onActivityChange: (v: string) => void;
  foodTierKey: string;
  onFoodTierChange: (k: string) => void;
  customFoodPrice: string;
  onPriceChange: (v: string) => void;
  customAmount: string;
  onCustomAmountChange: (v: string) => void;
  cityMult: number;
  adjustedCost: number;
  weightUnit: "lb" | "kg";
  displayWeight: (lbs: number) => number;
  weightSuffix: string;
}) {
  const ft = t.calc.foodDetail;
  const ta = t.calc.activity;
  const tf = t.calc.foodTiers;

  return (
    <div className="mb-3 mt-2 rounded-xl border border-border/60 bg-background p-5">
      {/* ── Calculation Steps ── */}
      <h4 className="text-base font-semibold">{ft.howTitle}</h4>
      <p className="mt-1 text-sm leading-relaxed text-muted">{ft.howDesc}</p>

      <div className="mt-4 space-y-2.5">
        <Step
          n={1}
          label={ft.step1}
          formula={
            weightUnit === "lb"
              ? `${fd(calc.weightLbs, 0)} lbs × 0.4536`
              : `${fd(calc.weightKg, 2)} kg`
          }
          result={
            weightUnit === "lb"
              ? `${fd(calc.weightKg, 2)} kg`
              : `${fd(calc.weightKg, 2)} kg`
          }
        />
        <Step
          n={2}
          label={ft.step2}
          formula={`70 × ${fd(calc.weightKg, 2)}^0.75 (=${fd(calc.weightKg075, 2)})`}
          result={`${fd(calc.rer, 0)} kcal / day`}
        />
        <Step
          n={3}
          label={ft.step3}
          formula={`${fd(calc.rer, 0)} × ${calc.activityFactor} (${ft.activityFactor})`}
          result={`${fd(calc.mer, 0)} kcal / day`}
        />
        <Step
          n={4}
          label={ft.step4}
          formula={`${fd(calc.mer, 0)} ÷ ${fmt(FOOD_KCAL_PER_KG)} kcal/kg`}
          result={
            weightUnit === "lb"
              ? `${fd(calc.dailyKg, 3)} kg (${fd(calc.dailyLbs, 2)} lbs)`
              : `${fd(calc.dailyKg, 3)} kg (${fd(calc.dailyLbs, 2)} lbs)`
          }
        />
        <Step
          n={5}
          label={ft.step5}
          formula={
            weightUnit === "lb"
              ? `${fd(calc.dailyLbs, 2)} lbs × ${DAYS_PER_MONTH} days`
              : `${fd(calc.dailyKg, 3)} kg × ${DAYS_PER_MONTH} days`
          }
          result={
            weightUnit === "lb"
              ? `${fd(calc.monthlyLbs, 1)} lbs / mo`
              : `${fd(calc.monthlyLbs * LBS_TO_KG, 1)} kg / mo`
          }
        />
        <Step
          n={6}
          label={ft.step6}
          formula={
            weightUnit === "lb"
              ? `${fd(calc.monthlyLbs, 1)} × $${fd(calc.pricePerLb, 2)}/lb`
              : `${fd(calc.monthlyLbs * LBS_TO_KG, 1)} kg × $${fd(calc.pricePerLb / LBS_TO_KG, 2)}/kg`
          }
          result={`$${fd(calc.monthlyCost, 2)}`}
        />
        {cityMult !== 1.0 && (
          <Step
            n={7}
            label={ft.step7}
            formula={`$${fd(calc.monthlyCost, 2)} × ${cityMult}`}
            result={`$${fmt(adjustedCost)} / mo`}
            highlight
          />
        )}
      </div>

      {/* ── Customize ── */}
      <div className="mt-5 border-t border-border/40 pt-5">
        <h4 className="text-base font-semibold">{ft.customizeTitle}</h4>
        <p className="mt-0.5 text-sm text-muted">{ft.customizeDesc}</p>

        {/* Weight */}
        <label className="mt-4 block">
          <span className="text-sm font-medium text-muted">
            {weightUnit === "lb" ? ft.weightLabelLb : ft.weightLabelKg}
          </span>
          <div className="relative mt-1">
            <input
              type="number"
              inputMode="decimal"
              min={weightUnit === "lb" ? 1 : 0.5}
              max={weightUnit === "lb" ? 300 : 140}
              step={weightUnit === "lb" ? 1 : 0.5}
              placeholder={`${displayWeight(defaultWeight).toFixed(weightSuffix === "kg" ? 1 : 0)} (${ft.defaultForSize})`}
              value={
                customWeightLbs != null
                  ? displayWeight(customWeightLbs).toFixed(
                      weightSuffix === "kg" ? 1 : 0
                    )
                  : ""
              }
              onChange={(e) => onWeightChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-12 text-sm tabular-nums outline-none transition-colors placeholder:text-muted/50 focus:border-primary"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              {weightUnit === "lb" ? ft.weightUnitLb : ft.weightUnitKg}
            </span>
          </div>
          {customWeightLbs != null && (
            <button
              onClick={() => onWeightChange("")}
              className="mt-1 text-sm text-primary hover:underline"
            >
              {ft.resetTo} (
              {displayWeight(defaultWeight).toFixed(weightSuffix === "kg" ? 1 : 0)}{" "}
              {weightSuffix})
            </button>
          )}
        </label>

        {/* Activity Level */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted">
            {ft.activityLabel}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ACTIVITY_KEYS.map((k) => {
              const a = ta[k as keyof typeof ta];
              return (
                <button
                  key={k}
                  onClick={() => onActivityChange(k)}
                  title={a.desc}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                    activityKey === k
                      ? "bg-primary text-white shadow-sm"
                      : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                  }`}
                >
                  {a.label} ({ACTIVITY_FACTORS[k]}×)
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-muted/60">
            {ta[activityKey as keyof typeof ta]?.desc} · {ft.factorNote}
          </p>
        </div>

        {/* Food Quality */}
        <div className="mt-4">
          <span className="text-sm font-medium text-muted">
            {ft.foodQualityLabel}
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {FOOD_TIER_KEYS.map((k) => {
              const tier = tf[k as keyof typeof tf];
              return (
                <button
                  key={k}
                  onClick={() => onFoodTierChange(k)}
                  title={tier.desc}
                  className={`rounded-lg px-2 py-2 text-center transition-all ${
                    foodTierKey === k && !customFoodPrice
                      ? "bg-primary text-white shadow-sm"
                      : "bg-foreground/[.06] text-muted hover:bg-foreground/[.10]"
                  }`}
                >
                  <span className="block text-sm font-medium">
                    {tier.label}
                  </span>
                  <span className="block text-xs opacity-70">
                    {weightUnit === "lb"
                      ? `$${FOOD_TIER_PRICES[k].toFixed(2)}/lb`
                      : `$${(FOOD_TIER_PRICES[k] / LBS_TO_KG).toFixed(2)}/kg`}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-muted">{ft.orCustom}</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0.01}
                step={0.1}
                placeholder={
                  FOOD_TIER_PRICES[foodTierKey]?.toFixed(2) ?? "2.50"
                }
                value={customFoodPrice}
                onChange={(e) => onPriceChange(e.target.value)}
                className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-xs tabular-nums outline-none transition-colors placeholder:text-muted/50 focus:border-primary"
              />
              <span className="text-sm text-muted">{ft.perLb}</span>
            </div>
          </div>
        </div>

        {/* Custom amount override */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-muted">
            {t.calc.customAmount}
          </label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted">$</span>
            <input
              type="number"
              placeholder={String(adjustedCost)}
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
            />
            <span className="text-xs text-muted">{t.calc.perMoShort}</span>
          </div>
          {customAmount && (
            <button
              type="button"
              onClick={() => onCustomAmountChange("")}
              className="mt-1 text-sm text-primary hover:underline"
            >
              {ft.customAmountClear}
            </button>
          )}
        </div>
      </div>

      {/* ── Sources ── */}
      <div className="mt-5 border-t border-border/40 pt-4">
        <p className="text-sm font-semibold text-muted">
          {ft.sourcesTitle}
        </p>
        <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted/70">
          <li className="flex items-start gap-1.5">
            <span className="mt-px shrink-0">📄</span>
            <span>
              <a
                href="https://www.aaha.org/nutrition"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {ft.aahaTitle}
              </a>{" "}
              {ft.aahaDesc}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-px shrink-0">🔗</span>
            <span>
              <a
                href="https://www.purina.com/articles/dog/feeding/guides/how-much-should-i-feed-my-dog"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {ft.purinaTitle}
              </a>{" "}
              {ft.purinaDesc}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-px shrink-0">🛒</span>
            <span>{ft.retailNote}</span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted/50">
          {ft.energyNote.replace("{kcal}", fmt(FOOD_KCAL_PER_KG))}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════ Shared Sub-Components ═══════════════════ */

function Step({
  n,
  label,
  formula,
  result,
  highlight,
}: {
  n: number;
  label: string;
  formula: string;
  result: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg px-2.5 py-2 ${
        highlight ? "bg-primary/5" : ""
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-0.5 font-mono text-sm leading-relaxed text-foreground/70">
          {formula} ={" "}
          <span className="font-semibold text-foreground">{result}</span>
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  total,
  suffix,
  children,
}: {
  title: string;
  total: number;
  suffix: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6">
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm font-semibold tabular-nums text-primary">
          ${fmt(total)}
          <span className="font-normal text-muted">{suffix}</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
  onLabelClick,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabelClick?: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface p-4">
      <button
        type="button"
        onClick={onLabelClick}
        disabled={!onLabelClick}
        className={`min-w-0 flex-1 text-left transition-colors ${
          onLabelClick
            ? "cursor-pointer hover:text-primary"
            : "cursor-default"
        }`}
      >
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div
          className={`relative h-6 w-11 rounded-full transition-colors ${
            checked ? "bg-primary" : "bg-foreground/15"
          }`}
        >
          <div
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </div>
      </button>
    </div>
  );
}

