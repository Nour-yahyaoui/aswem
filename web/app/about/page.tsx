import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "عن الموقع",
  description: "أسعم: موقع مجاني ومفتوح المصدر لمقارنة أسعار المواد في الولايات التونسية.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="space-y-5 text-neutral-800 leading-relaxed">
      <h1 className="text-2xl font-bold">عن أسعم</h1>
      <p>
        أسعم موقع مجاني ومفتوح المصدر. يساعدك تشوف ثمن المواد في كل ولاية، وتقارن بين المناطق، وتعرف الأرخص.
        الأسعار تزيدها الجماعة، وكل تصريح يتسجل بالولاية والمحل أو المنطقة، والتاريخ.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">كيفاش تخدم؟</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          <li>كل تصريح فيه المادة، الثمن، الولاية، واسم المحل أو المنطقة.</li>
          <li>الموقع يحسب الوسيط والأدنى لكل ولاية على آخر 30 يوم.</li>
          <li>الأثمان اللي تبان غريبة برشا ما تتسجلش، باش الأرقام تبقى صحيحة.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">الخصوصية</h2>
        <ul className="list-disc space-y-1 ps-5 text-sm">
          <li>ما نطلبوش تسجيل، ولا نحفظوش صور.</li>
          <li>الموقع الجغرافي يتسجل تقريبي (حوالي 110 متر)، ولا يظهر للعموم.</li>
          <li>ما تكتبش عنوان دارك. اكتب اسم المحل أو المنطقة فقط.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">تواصل معانا</h2>
        <p className="text-sm">
          صنع بواسطة <strong>{SITE.author}</strong>.{" "}
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4" dir="ltr">
            GitHub: Nour-yahyaoui
          </a>{" "}
          · <a href={`tel:${SITE.phoneTel}`} className="text-brand underline underline-offset-4" dir="ltr">{SITE.phoneDisplay}</a>
        </p>
        <p className="text-sm">
          الكود مفتوح المصدر على{" "}
          <a href={SITE.repo} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4">
            GitHub
          </a>
          .
        </p>
      </section>
    </article>
  );
}
