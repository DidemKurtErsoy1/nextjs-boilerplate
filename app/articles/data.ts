// app/articles/data.ts

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  updatedAt: string; // ISO string
  sections: Array<{ heading: string; body: string[] }>;
  faq: Array<{ q: string; a: string }>;
  sources?: string[];
};

export const articles: Article[] = [
  {
    slug: "starting-solids-6-9-months",
    title: "Starting Solids (6–9 Months): A Calm, Practical Guide",
    excerpt:
      "How to introduce solids safely, what to expect each week, and when to speak to a doctor.",
    author: "BabyQ Editorial",
    updatedAt: "2025-09-20",
    sections: [
      {
        heading: "What to Expect by Age",
        body: [
          "6–7 months: single-ingredient purées, iron-rich foods first.",
          "7–8 months: thicker textures, soft finger foods under supervision.",
          "8–9 months: 2–3 small meals/day, offer water in an open/sippy cup.",
        ],
      },
      {
        heading: "Common Concerns",
        body: [
          "Gagging vs choking: gagging is common while learning.",
          "Constipation: offer water, fiber-rich fruits (pear, prune), and movement.",
          "Allergens: introduce one at a time; watch for reactions.",
        ],
      },
      {
        heading: "When to Seek Medical Care",
        body: [
          "Breathing difficulty, lip/face swelling, widespread hives.",
          "Blood in stool, persistent vomiting, poor hydration/urination.",
        ],
      },
      {
        heading: "Quick Tips",
        body: [
          "Sit upright in a high chair; never leave baby unattended.",
          "Offer variety; keep salt/sugar low.",
          "Follow baby’s hunger/fullness cues.",
        ],
      },
      {
        heading: "Sources",
        body: [
          "AAP feeding guidelines, WHO infant nutrition recommendations.",
        ],
      },
    ],
    faq: [
      { q: "How much should my baby eat per meal?", a: "Start with 1–2 tsp and increase gradually based on interest." },
      { q: "Is water okay?", a: "Small sips with meals are fine from ~6 months unless advised otherwise." },
      { q: "What about choking risk?", a: "Serve soft, pea-sized pieces; avoid hard/round foods; supervise closely." },
      { q: "Do I need vitamins?", a: "Iron-rich foods are important; ask your clinician about supplements." },
    ],
    sources: ["AAP, WHO"],
  },
  {
    slug: "fever-basics",
    title: "Fever Basics: What Parents Should Know",
    excerpt: "Understanding temperatures, comfort measures, and red flags.",
    author: "BabyQ Editorial",
    updatedAt: "2025-09-18",
    sections: [
      { heading: "Definition", body: ["Fever is typically ≥38.0°C measured properly."] },
      { heading: "Comfort Measures", body: ["Light clothing, fluids, room ventilation."] },
      { heading: "When to See a Doctor", body: ["<3 months with ≥38°C, breathing issues, persistent high fever, poor general state."] },
    ],
    faq: [
      { q: "Which thermometer?", a: "Use a reliable digital thermometer; follow device instructions." },
      { q: "Baths?", a: "Avoid cold baths/alcohol rubs; focus on comfort and hydration." },
    ],
  },
];
