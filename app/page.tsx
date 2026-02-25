import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">
        PetPat
      </h1>

      <p className="text-lg mb-6 max-w-xl">
        Estimate the real cost of owning a dog in the United States.
        Built for families and international students.
      </p>

      <Link
        href="/calculator"
        className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-80 transition"
      >
        Try the Dog Cost Calculator
      </Link>

      <p className="mt-10 text-sm text-gray-500">
        美国养狗成本计算器 | 为家庭与留学生设计
      </p>
    </main>
  );
}