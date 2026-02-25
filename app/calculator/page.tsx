"use client";

import { useState } from "react";

export default function Calculator() {
  const [size, setSize] = useState("medium");
  const [cityLevel, setCityLevel] = useState("average");
  const [insurance, setInsurance] = useState(false);

  const baseFood = {
    small: 40,
    medium: 70,
    large: 110,
  };

  const cityMultiplier = {
    low: 0.85,
    average: 1,
    high: 1.25,
  };

  const monthlyFood = baseFood[size as keyof typeof baseFood];
  const preventive = 25;
  const grooming = 60;
  const insuranceCost = insurance ? 45 : 0;
  const annualVet = 300;

  const monthlyTotal =
    (monthlyFood + preventive + grooming + insuranceCost) *
    cityMultiplier[cityLevel as keyof typeof cityMultiplier];

  const yearlyTotal = monthlyTotal * 12 + annualVet;
  const firstYearTotal = yearlyTotal + 600;

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dog Cost Calculator</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block mb-2">Dog Size</label>
          <select
            className="border p-2 w-full"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="small">Small (0–20 lbs)</option>
            <option value="medium">Medium (20–50 lbs)</option>
            <option value="large">Large (50+ lbs)</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">City Cost Level</label>
          <select
            className="border p-2 w-full"
            value={cityLevel}
            onChange={(e) => setCityLevel(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="average">Average</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
            />
            Include Insurance
          </label>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Estimated Costs</h2>
        <p className="text-lg">
        Monthly Cost: <span className="font-semibold">${monthlyTotal.toFixed(0)}</span>
        </p>

        <p className="text-lg">
        Annual Cost: <span className="font-semibold">${yearlyTotal.toFixed(0)}</span>
        </p>

        <p className="text-lg">
        First Year Total (with setup): <span className="font-semibold">
            ${firstYearTotal.toFixed(0)}
        </span>
        </p>
      </div>

      <div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">
    Recommended Essentials
  </h2>

  <div className="grid gap-4">

    <div className="border p-4 rounded-lg">
      <h3 className="font-semibold">Dog Crate</h3>
      <p className="text-sm text-gray-600 mb-2">
        Choose a size appropriate crate for your dog. Helps with training and safety.
      </p>
      <a
        href="#"
        className="text-blue-600 underline"
        target="_blank"
      >
        View on Amazon
      </a>
    </div>

    <div className="border p-4 rounded-lg">
      <h3 className="font-semibold">Dry Dog Food</h3>
      <p className="text-sm text-gray-600 mb-2">
        High-quality dry food based on your dog's size and life stage.
      </p>
      <a
        href="#"
        className="text-blue-600 underline"
        target="_blank"
      >
        View on Amazon
      </a>
    </div>

    <div className="border p-4 rounded-lg">
      <h3 className="font-semibold">Flea & Tick Prevention</h3>
      <p className="text-sm text-gray-600 mb-2">
        Monthly preventive medication is essential for US households.
      </p>
      <a
        href="#"
        className="text-blue-600 underline"
        target="_blank"
      >
        View on Amazon
      </a>
    </div>

  </div>
</div>


    </main>
  );
}