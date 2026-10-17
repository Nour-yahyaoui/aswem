/**
 * UI copy for every supported language. Safe to import from server and client code.
 * Arabic is written in Tunisian Darija; French is standard French.
 */

export const LOCALES = ["ar", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

const ar = {
  languageName: "Français",
  brand: "أسوام",
  brandLatin: "Aswem",
  tagline: "شوف الأسعار في كل ولاية في تونس، وزيد الثمن اللي شفتو بالمجان.",
  description: "أسوام: شوف ثمن المواد في كل ولاية في تونس، وزيد الأسعار اللي تشوفها بالمجان. Aswem: prix des produits dans toute la Tunisie.",
  htmlLang: "ar-TN",
  dateLocale: "ar-TN",
  nav: {
    label: "التنقل الرئيسي",
    home: "الرئيسية",
    search: "بحث",
    submit: "زيد ثمن",
    about: "عن الموقع",
  },
  search: {
    label: "بحث عن مادة",
    placeholder: "اكتب المادة: حليب، زيت، سكر…",
    button: "بحث",
    title: "بحث",
    pageTitle: "بحث عن المواد",
    resultsTitle: "نتائج البحث: {query}",
    notFoundTitle: "ما لقيناش المادة هذي",
    notFoundText: "جرب كلمة أخرى، ولا زيد الثمن وخلي الجماعة تلقاها.",
    addPrice: "زيد ثمن",
  },
  home: {
    title: "شوف الثمن قبل ما تخلص",
    categories: "الأصناف",
    products: "المواد",
    seeAll: "شوف الكل",
    newPriceTitle: "عندك ثمن جديد؟",
    newPriceText: "زيدو باش يستفيد منو الكل. مجاني وبلا تسجيل.",
    addPrice: "زيد ثمن",
  },
  product: {
    breadcrumbLabel: "مسار التنقل",
    breadcrumbHome: "الرئيسية",
    breadcrumbProducts: "المواد",
    summary: "ملخص",
    cheapestMedian: "أرخص وسيط",
    reports: "التصريحات",
    last30Days: "آخر 30 يوم",
    lastUpdate: "آخر تحديث",
    byGovernorate: "الثمن حسب الولاية",
    governorate: "الولاية",
    median: "الوسيط",
    min: "الأدنى",
    count: "التصريحات",
    recent: "آخر التصريحات",
    noData: "ما فماش تصاريح لهالمادة توّا. كون أول واحد يزيد ثمنها.",
    addPriceFor: "زيد ثمن {name}",
    notFound: "مادة غير موجودة",
    metaTitle: "سعر {name} في تونس",
    metaBest: "أرخص وسيط لـ{name}: {price} في {gov}. شوف الأسعار في كل الولايات وزيد الثمن اللي شفتو.",
    reportsTitle: "بلاغات تمت مراجعتها (آخر 30 يوم)",
    reportsText: "هاذي بلاغات مراجعة من الفريق. ما تبانش فيها أسماء المحلات.",
    reportCta: "لقيت مشكل في هالمادة؟",
    reportCtaButton: "بلّغ",
    metaNoData: "شوف ثمن {name} في كل ولاية في تونس، وزيد الثمن اللي شفتو بالمجان.",
  },
  submit: {
    title: "زيد ثمن",
    subtitle: "شارك الثمن اللي شفتو، وخلي الجماعة تستفيد.",
    metaDescription: "زيد ثمن المادة اللي شفتها في الولاية متاعك، بالمجان وبلا تسجيل.",
    product: "المادة",
    chooseProduct: "اختار المادة",
    price: "الثمن بالدينار",
    priceHint: "كتبه بالدينار، مثلاً 3.500 أو 3,5",
    pricePlaceholder: "مثلاً 3.500",
    governorate: "الولاية",
    chooseGovernorate: "اختار الولاية",
    useMyPosition: "استعمل موقعي",
    locating: "نحدد موقعك…",
    geoIdle: "موقعك ما يتسجلش بالدقة، نحفظو تقريبي برك.",
    geoPicked: "تم اختيار ولاية {gov} من موقعك. تقدر تبدلها.",
    geoDenied: "ما تنجمش نحدد موقعك. اختار الولاية يدوياً.",
    geoUnsupported: "المتصفح ما يعطيش الموقع. اختار الولاية يدوياً.",
    place: "المحل أو المنطقة",
    placeOptional: "(اختياري إذا استعملت موقعك)",
    placeHint: "اكتب اسم المحل أو المنطقة فقط. لا تكتب عنوان دارك.",
    placePlaceholder: "مثلاً: سوبرماركت، حي النصر",
    submit: "إرسال الثمن",
    submitting: "نسجلو…",
    privacy: "مجاني، بلا تسجيل. ما نحفظوش صورك ولا بياناتك الشخصية.",
    successTitle: "شكراً! الثمن تسجل.",
    successLink: "شوف الأسعار الجديدة",
    errors: {
      honeypot: "تعذر إرسال الثمن، عاود جرب.",
      product: "اختار المادة.",
      governorate: "اختار الولاية.",
      priceInvalid: "الثمن ما هوش صحيح.",
      priceRange: "الثمن برا المجال المسموح (من 0.100 إلى 10000 د.ت).",
      placeTooLong: "اسم المحل أو المنطقة طويل بزاف.",
      locationPartial: "الموقع ناقص، عاود جرب.",
      placeOrLocation: "زيد اسم المحل أو المنطقة، ولا استعمل موقعك.",
      unavailable: "الخدمة مش متوفرة توّا.",
      network: "الخدمة مش متوفرة توّا، عاود جرب بعد شوية.",
      rateLimited: "بزاف تصاريح من الجهاز هذا، استنى شوية.",
      badRequest: "المعلومات ماشي صحيحة، أو الثمن بعيد على المعدل. تأكد منها وعاود جرب.",
      generic: "صارت مشكلة، عاود جرب بعد شوية.",
    },
  },
  report: {
    title: "بلّغ على مشكل",
    metaTitle: "بلاغ عن منتج",
    metaDescription: "بلّغ على منتج منتهي الصلاحية، فاسد، أو تغليفو غالط. بالمجان وبلا تسجيل.",
    product: "المادة",
    chooseProduct: "اختار المادة",
    governorate: "الولاية",
    chooseGovernorate: "اختار الولاية",
    reason: "السبب",
    chooseReason: "اختار السبب",
    reasons: {
      expired: "منتهي الصلاحية",
      spoiled: "فاسد",
      wrong_label: "التغليف أو الثمن غالط",
      other: "أخرى",
    },
    note: "تفاصيل (اختياري)",
    notePlaceholder: "مثلاً: التاريخ مكتوب على الكيس، الطعم غريب…",
    noteHint: "ما تكتبش اسمك ولا رقم تيليفونك.",
    disclaimer: "البلاغات تتراجع قبل ما تبان للعموم، وما تبانش فيها أسماء المحلات. إذا كان المشكل صحي وخطير، بلّغ السلطات المختصة مباشرة.",
    submit: "إرسال البلاغ",
    submitting: "نسجلو…",
    successTitle: "شكراً! البلاغ وصل، ونراجعوه.",
    errors: {
      honeypot: "تعذر إرسال البلاغ، عاود جرب.",
      product: "اختار المادة.",
      governorate: "اختار الولاية.",
      reason: "اختار السبب.",
      noteTooLong: "التفاصيل طويلة بزاف (300 حرف كحد أقصى).",
      unavailable: "الخدمة مش متوفرة توّا.",
      network: "الخدمة مش متوفرة توّا، عاود جرب بعد شوية.",
      rateLimited: "بزاف بلاغات من الجهاز هذا، استنى شوية.",
      badRequest: "المعلومات ماشي صحيحة. تأكد منها وعاود جرب.",
      generic: "صارت مشكلة، عاود جرب بعد شوية.",
    },
  },
  theme: {
    label: "تبديل المظهر",
    dark: "الوضع الليلي",
    light: "الوضع النهاري",
  },
  footer: {
    free: "{name} مجاني 100%، ومفتوح المصدر. الأسعار تزيدها الجماعة، وهي تقريبية.",
    builtBy: "صنع بواسطة",
    sourceCode: "الكود المصدري",
    about: "عن الموقع",
  },
  unavailable: {
    title: "الخدمة مش متوفرة توّا",
    text: "عاود جرب بعد شوية. إذا المشكل يعاود، قلنا في GitHub.",
  },
  notFound: {
    title: "الصفحة هذي ما لقيناهاش",
    home: "الرئيسية",
  },
  about: {
    title: "عن أسوام",
    metaDescription: "أسوام: موقع مجاني ومفتوح المصدر لمقارنة أسعار المواد في الولايات التونسية.",
    intro:
      "أسوام موقع مجاني ومفتوح المصدر. يساعدك تشوف ثمن المواد في كل ولاية، وتقارن بين المناطق، وتعرف الأرخص. الأسعار تزيدها الجماعة، وكل تصريح يتسجل بالولاية والمحل أو المنطقة، والتاريخ.",
    howTitle: "كيفاش تخدم؟",
    how: [
      "كل تصريح فيه المادة، الثمن، الولاية، واسم المحل أو المنطقة.",
      "الموقع يحسب الوسيط والأدنى لكل ولاية على آخر 30 يوم.",
      "الأثمان اللي تبان غريبة برشا ما تتسجلش، باش الأرقام تبقى صحيحة.",
    ],
    privacyTitle: "الخصوصية",
    privacy: [
      "ما نطلبوش تسجيل، ولا نحفظوش صور.",
      "الموقع الجغرافي يتسجل تقريبي (حوالي 110 متر)، ولا يظهر للعموم.",
      "ما تكتبش عنوان دارك. اكتب اسم المحل أو المنطقة فقط.",
    ],
    contactTitle: "تواصل معانا",
    builtBy: "صنع بواسطة",
    sourceCode: "الكود مفتوح المصدر على",
  },
  categories: {
    laiterie: "الحليب والجبن",
    epicerie: "بقالة",
    boulangerie: "خبز",
    "fruits-legumes": "خضر وغلال",
    boucherie: "لحوم",
    boissons: "مشروبات",
    hygiene: "نظافة",
    carburant: "محروقات",
  },
};

export type Dict = typeof ar;

const fr: Dict = {
  languageName: "العربية",
  brand: "أسوام",
  brandLatin: "Aswem",
  tagline: "Comparez les prix dans chaque gouvernorat de Tunisie, et partagez le prix que vous voyez, gratuitement.",
  description: "Aswem (أسوام) : comparez les prix des produits dans chaque gouvernorat de Tunisie, et partagez les prix que vous voyez. Gratuit et open source.",
  htmlLang: "fr-TN",
  dateLocale: "fr-TN",
  nav: {
    label: "Navigation principale",
    home: "Accueil",
    search: "Recherche",
    submit: "Ajouter",
    about: "À propos",
  },
  search: {
    label: "Rechercher un produit",
    placeholder: "Produit : lait, huile, sucre…",
    button: "Chercher",
    title: "Recherche",
    pageTitle: "Rechercher des produits",
    resultsTitle: "Résultats pour : {query}",
    notFoundTitle: "Aucun produit trouvé",
    notFoundText: "Essayez un autre mot, ou ajoutez le prix et laissez la communauté le trouver.",
    addPrice: "Ajouter un prix",
  },
  home: {
    title: "Voyez le prix avant d'acheter",
    categories: "Catégories",
    products: "Produits",
    seeAll: "Voir tout",
    newPriceTitle: "Vous avez un nouveau prix ?",
    newPriceText: "Partagez-le pour aider tout le monde. Gratuit, sans inscription.",
    addPrice: "Ajouter un prix",
  },
  product: {
    breadcrumbLabel: "Fil d'Ariane",
    breadcrumbHome: "Accueil",
    breadcrumbProducts: "Produits",
    summary: "Résumé",
    cheapestMedian: "Médiane la plus basse",
    reports: "Signalements",
    last30Days: "30 derniers jours",
    lastUpdate: "Dernière mise à jour",
    byGovernorate: "Prix par gouvernorat",
    governorate: "Gouvernorat",
    median: "Médiane",
    min: "Minimum",
    count: "Signalements",
    recent: "Derniers signalements",
    noData: "Aucun signalement pour ce produit pour l'instant. Soyez le premier à ajouter son prix.",
    addPriceFor: "Ajouter un prix pour {name}",
    notFound: "Produit introuvable",
    metaTitle: "Prix de {name} en Tunisie",
    metaBest: "Médiane la plus basse pour {name} : {price} à {gov}. Comparez les prix dans tous les gouvernorats.",
    reportsTitle: "Signalements vérifiés (30 derniers jours)",
    reportsText: "Ces signalements ont été examinés par l'équipe. Aucun nom de magasin n'est affiché.",
    reportCta: "Vous avez repéré un problème avec ce produit ?",
    reportCtaButton: "Signaler",
    metaNoData: "Prix de {name} dans chaque gouvernorat de Tunisie. Ajoutez le prix que vous voyez, gratuitement.",
  },
  submit: {
    title: "Ajouter un prix",
    subtitle: "Partagez le prix que vous avez vu, pour aider les autres.",
    metaDescription: "Ajoutez le prix d'un produit vu dans votre gouvernorat, gratuitement et sans inscription.",
    product: "Produit",
    chooseProduct: "Choisissez un produit",
    price: "Prix en dinars",
    priceHint: "En dinars, par exemple 3,500 ou 3.5",
    pricePlaceholder: "par exemple 3,500",
    governorate: "Gouvernorat",
    chooseGovernorate: "Choisissez un gouvernorat",
    useMyPosition: "Utiliser ma position",
    locating: "Localisation…",
    geoIdle: "Votre position est enregistrée de façon approximative seulement.",
    geoPicked: "Gouvernorat {gov} choisi d'après votre position. Vous pouvez le changer.",
    geoDenied: "Impossible de déterminer votre position. Choisissez le gouvernorat manuellement.",
    geoUnsupported: "Votre navigateur ne fournit pas la position. Choisissez le gouvernorat manuellement.",
    place: "Magasin ou quartier",
    placeOptional: "(facultatif si vous utilisez votre position)",
    placeHint: "Indiquez seulement le nom du magasin ou du quartier. N'indiquez pas votre adresse personnelle.",
    placePlaceholder: "par exemple : Supermarché, quartier Ennasr",
    submit: "Envoyer le prix",
    submitting: "Envoi…",
    privacy: "Gratuit, sans inscription. Nous ne conservons aucune photo ni donnée personnelle.",
    successTitle: "Merci ! Le prix a été enregistré.",
    successLink: "Voir les nouveaux prix",
    errors: {
      honeypot: "Impossible d'envoyer le prix, réessayez.",
      product: "Choisissez un produit.",
      governorate: "Choisissez un gouvernorat.",
      priceInvalid: "Le prix n'est pas valide.",
      priceRange: "Le prix est hors limites (de 0,100 à 10 000 DT).",
      placeTooLong: "Le nom du magasin ou du quartier est trop long.",
      locationPartial: "Position incomplète, réessayez.",
      placeOrLocation: "Indiquez le magasin ou le quartier, ou utilisez votre position.",
      unavailable: "Le service n'est pas disponible pour le moment.",
      network: "Le service n'est pas disponible pour le moment, réessayez plus tard.",
      rateLimited: "Trop de signalements depuis cet appareil, attendez un peu.",
      badRequest: "Les informations ne sont pas valides, ou le prix est très éloigné de la moyenne. Vérifiez et réessayez.",
      generic: "Un problème est survenu, réessayez plus tard.",
    },
  },
  report: {
    title: "Signaler un problème",
    metaTitle: "Signaler un produit",
    metaDescription: "Signalez un produit périmé, avarié ou mal étiqueté. Gratuit, sans inscription.",
    product: "Produit",
    chooseProduct: "Choisissez un produit",
    governorate: "Gouvernorat",
    chooseGovernorate: "Choisissez un gouvernorat",
    reason: "Motif",
    chooseReason: "Choisissez un motif",
    reasons: {
      expired: "Périmé",
      spoiled: "Avarié",
      wrong_label: "Étiquetage ou prix incorrect",
      other: "Autre",
    },
    note: "Détails (facultatif)",
    notePlaceholder: "par exemple : date écrite sur le sachet, goût inhabituel…",
    noteHint: "N'indiquez ni votre nom ni votre numéro de téléphone.",
    disclaimer: "Les signalements sont vérifiés avant d'être publiés, et les noms de magasins ne sont jamais affichés. En cas de problème de santé grave, contactez directement les autorités compétentes.",
    submit: "Envoyer le signalement",
    submitting: "Envoi…",
    successTitle: "Merci ! Votre signalement a bien été reçu et sera examiné.",
    errors: {
      honeypot: "Impossible d'envoyer le signalement, réessayez.",
      product: "Choisissez un produit.",
      governorate: "Choisissez un gouvernorat.",
      reason: "Choisissez un motif.",
      noteTooLong: "Les détails sont trop longs (300 caractères maximum).",
      unavailable: "Le service n'est pas disponible pour le moment.",
      network: "Le service n'est pas disponible pour le moment, réessayez plus tard.",
      rateLimited: "Trop de signalements depuis cet appareil, attendez un peu.",
      badRequest: "Les informations ne sont pas valides. Vérifiez et réessayez.",
      generic: "Un problème est survenu, réessayez plus tard.",
    },
  },
  theme: {
    label: "Changer le thème",
    dark: "Mode sombre",
    light: "Mode clair",
  },
  footer: {
    free: "{name} est gratuit et open source. Les prix sont partagés par la communauté et sont donnés à titre indicatif.",
    builtBy: "Créé par",
    sourceCode: "Code source",
    about: "À propos",
  },
  unavailable: {
    title: "Service indisponible pour le moment",
    text: "Réessayez dans quelques instants. Si le problème persiste, signalez-le sur GitHub.",
  },
  notFound: {
    title: "Cette page est introuvable",
    home: "Accueil",
  },
  about: {
    title: "À propos d'Aswem",
    metaDescription: "Aswem : un site gratuit et open source pour comparer les prix des produits dans les gouvernorats de Tunisie.",
    intro:
      "Aswem est un site gratuit et open source. Il vous aide à voir le prix des produits dans chaque gouvernorat, à comparer les régions et à trouver le moins cher. Les prix sont partagés par la communauté ; chaque signalement indique le gouvernorat, le magasin ou le quartier, et la date.",
    howTitle: "Comment ça marche ?",
    how: [
      "Chaque signalement contient le produit, le prix, le gouvernorat et le nom du magasin ou du quartier.",
      "Le site calcule la médiane et le minimum de chaque gouvernorat sur les 30 derniers jours.",
      "Les prix jugés très éloignés de la moyenne ne sont pas acceptés, pour garder des chiffres fiables.",
    ],
    privacyTitle: "Confidentialité",
    privacy: [
      "Aucune inscription n'est demandée, et aucune photo n'est conservée.",
      "La position est enregistrée de façon approximative (environ 110 mètres) et n'est pas affichée publiquement.",
      "N'indiquez pas votre adresse personnelle, seulement le nom du magasin ou du quartier.",
    ],
    contactTitle: "Contact",
    builtBy: "Créé par",
    sourceCode: "Le code est open source sur",
  },
  categories: {
    laiterie: "Laitages",
    epicerie: "Épicerie",
    boulangerie: "Boulangerie",
    "fruits-legumes": "Fruits et légumes",
    boucherie: "Boucherie",
    boissons: "Boissons",
    hygiene: "Hygiène",
    carburant: "Carburants",
  },
};

export const dictionaries: Record<Locale, Dict> = { ar, fr };

export function t(locale: Locale): Dict {
  return dictionaries[locale];
}

/** Replaces {placeholders} in a translated string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function productName(p: { name_ar: string; name_latin: string }, locale: Locale): string {
  return locale === "ar" ? p.name_ar : p.name_latin;
}

export function governorateName(g: { name_ar: string; name_latin: string }, locale: Locale): string {
  return locale === "ar" ? g.name_ar : g.name_latin;
}

export function categoryLabel(category: string, locale: Locale): string {
  const labels = t(locale).categories as Record<string, string>;
  return labels[category] ?? category;
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "fr" : "ar";
}
