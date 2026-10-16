export const SITE = {
  name: "أسعم",
  nameLatin: "Aswem",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aswem.vercel.app",
  description:
    "أسعم: شوف ثمن المواد في كل ولاية في تونس، وزيد الأسعار اللي تشوفها بالمجان. Aswem: compare prices across Tunisian governorates.",
  shortDescription: "شوف الأسعار في كل ولاية في تونس، وزيد الثمن اللي شفتو بالمجان.",
  author: "Nour Yahyaoui",
  github: "https://github.com/Nour-yahyaoui",
  repo: "https://github.com/Nour-yahyaoui/riseoftheconqueror",
  phoneDisplay: "56 66 76 82",
  phoneTel: "+21656667682",
  currency: "TND",
  locale: "ar_TN",
  timeZone: "Africa/Tunis",
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  laiterie: "الحليب والجبن",
  epicerie: "بقالة",
  boulangerie: "خبز",
  "fruits-legumes": "خضر وغلال",
  boucherie: "لحوم",
  boissons: "مشروبات",
  hygiene: "نظافة",
  carburant: "محروقات",
};
