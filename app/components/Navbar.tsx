import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b py-4 px-6">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        
        <Link href="/" className="font-bold text-lg">
          PetPat
        </Link>

        <div className="space-x-6 text-sm">
          <Link href="/calculator" className="hover:underline">
            Calculator
          </Link>

          <Link href="/method" className="hover:underline">
            Method
          </Link>
        </div>

      </div>
    </nav>
  );
}