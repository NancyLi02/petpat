export default function MethodPage() {
  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Methodology & Assumptions</h1>

      <p>
        PetPat provides estimated cost ranges for owning a dog in the United States.
        These estimates are based on average market prices for food, preventive care,
        grooming, and routine veterinary services.
      </p>

      <h2 className="text-xl font-semibold mt-6">What is Included</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Monthly food expenses based on dog size</li>
        <li>Routine preventive medication (flea & heartworm)</li>
        <li>Estimated grooming costs</li>
        <li>Annual veterinary check-up and vaccines</li>
        <li>Optional insurance estimates</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Important Notes</h2>
      <p>
        Actual costs may vary depending on location, breed, health conditions,
        and lifestyle. This calculator is designed for planning and educational
        purposes only and should not replace professional veterinary advice.
      </p>

      <h2 className="text-xl font-semibold mt-6">Last Updated</h2>
      <p>March 2025</p>
    </main>
  );
}