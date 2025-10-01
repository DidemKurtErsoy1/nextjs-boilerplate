// app/articles/data.ts

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string; // ISO
  author: string;
  content: {
    hero?: string;
    sections: Array<{ h2: string; paras: string[]; bullets?: string[] }>;
    faq: Array<{ q: string; a: string }>;
    sources?: string[];
  };
};

export const articles: Article[] = [
  {
    slug: "starting-solids-6-9-months",
    title: "Starting Solids (6–9 months)",
    excerpt:
      "How to safely introduce solids, what to expect by age, common concerns, and when to call your doctor.",
    updatedAt: "2025-09-30",
    author: "BabyQ Editorial",
    content: {
      hero: "A gentle, safety-first guide to your baby’s first bites.",
      sections: [
        {
          h2: "What to expect by age",
          paras: [
            "Between 6–7 months, most babies are ready to explore purees or soft, mashed textures.",
            "By 8–9 months, finger foods and self-feeding skills improve, but supervision remains crucial."
          ],
          bullets: [
            "Signs of readiness: good head control, sitting with support, interest in food.",
            "Offer iron-rich options early (meat, legumes, fortified cereals)."
          ]
        },
        {
          h2: "Common concerns",
          paras: [
            "Gagging is common when learning textures; choking is silent and requires immediate action.",
            "Introduce one new food at a time to notice reactions."
          ],
          bullets: ["Avoid honey before 12 months.", "Cut round foods into small, soft pieces."]
        },
        {
          h2: "When to contact a doctor",
          paras: [
            "If there is trouble breathing, swelling of lips/face, repetitive vomiting, or hives spreading—seek urgent care."
          ]
        },
        {
          h2: "Quick tips",
          paras: ["Keep meals calm, short, and baby-led."],
          bullets: [
            "Sit upright; no feeding in car seat.",
            "Never leave baby unattended.",
            "Water is limited; breastmilk/formula remains primary."
          ]
        },
        {
          h2: "Sources",
          paras: [],
          bullets: [
            "AAP HealthyChildren.org",
            "WHO complementary feeding guidance"
          ]
        }
      ],
      faq: [
        { q: "How many meals per day?", a: "Start with 1, then 2, then 3 by 8–9 months if interested." },
        { q: "Allergy introduction?", a: "Peanut/egg early in tiny amounts if no contraindication; monitor closely." }
      ]
    }
  }
];
