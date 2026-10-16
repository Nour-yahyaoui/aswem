import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-xl font-semibold">الصفحة هذي ما لقيناهاش</h1>
      <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
        الرئيسية
      </Link>
    </div>
  );
}
