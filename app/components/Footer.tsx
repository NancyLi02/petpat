export default function Footer() {
  return (
    <footer className="mt-20 border-t pt-8 pb-6 text-sm text-gray-500">
      <div className="max-w-4xl mx-auto px-6 space-y-4 text-center">

        <p>
          PetPat is an independent dog cost estimation tool built for families
          and international students in the United States.
        </p>

        <p>
          This website provides estimated cost ranges for educational purposes only.
          Actual expenses may vary depending on location, breed, and lifestyle.
        </p>

        <p>
          Disclosure: PetPat may participate in affiliate programs in the future.
          If you purchase products through affiliate links, we may earn a small
          commission at no extra cost to you.
        </p>

        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} PetPat. All rights reserved.
        </p>

      </div>
    </footer>
  );
}