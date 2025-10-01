// app/articles/data.ts
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // simple md/paragraphs
};

export const articles: Article[] = [
  {
    slug: 'starting-solids-6-9-months',
    title: 'Starting Solids (6–9 months): A Calm, Practical Guide',
    excerpt: 'How to introduce solids safely, which textures to try first, and common myths.',
    content: `**When to start:** around 6 months *and* when your baby shows readiness (good head control, sits with support, interest in food).

**What to offer first:** iron-rich foods (meat purées, lentils), then soft fruits/veggies. One new food at a time.

**Textures:** smooth → mashed → soft lumps. Avoid hard, round, or sticky foods that are choking risks.

**Allergens:** introduce common allergens (peanut, egg, dairy) early in tiny amounts, one at a time, watching for reactions.

**Fluids:** milk/formula remains main nutrition; small sips of water with meals are okay.`
  },
  {
    slug: 'fever-basics',
    title: 'Fever Basics: What Matters and What Doesn’t',
    excerpt: 'Temperature numbers, comfort measures, and when to seek care.',
    content: `**Numbers:** Fever is usually ≥38.0°C. The number is *one* data point—how your baby looks/acts matters most.

**Comfort:** light clothing, fluids, room ventilation. Bath should be lukewarm; never ice or alcohol rubs.

**When to get help:** <3 months with ≥38.0°C; difficulty breathing, blue lips, seizures, persistent lethargy, or dehydration.`
  },
  {
    slug: 'cough-and-colds',
    title: 'Cough & Colds: What You Can Do at Home',
    excerpt: 'Saline, humidity, and realistic expectations.',
    content: `**Saline & suction:** for stuffy nose.
**Humidity:** cool-mist humidifier can help.
**Fluids:** frequent feeds/sips.
**Time:** most viral colds improve within 7–10 days. Seek care for breathing trouble, poor feeding, or high fever that persists.`
  },
  {
    slug: 'safe-sleep',
    title: 'Safe Sleep: Simple Rules That Save Lives',
    excerpt: 'Back to sleep, firm surface, no loose items.',
    content: `**Back to sleep** for every sleep.
**Crib/bed:** firm mattress, fitted sheet, no pillows/blankets/toys.
**Room share** (not bed-share) is safer in early months.`
  },
  {
    slug: 'hydration-diapers',
    title: 'Hydration & Diapers: What’s Normal?',
    excerpt: 'How many wet diapers to expect and when to worry.',
    content: `Expect ~6+ wet diapers/day after the newborn period. Fewer wet diapers, very dark urine, dry mouth, or lethargy can be dehydration—offer fluids and seek care if not improving.`
  },
  {
    slug: 'rash-checklist',
    title: 'Rash Checklist: When to Relax, When to Call',
    excerpt: 'Most rashes are harmless; here’s a quick triage.',
    content: `**Common & mild:** heat rash, drool rash—gentle skincare, time.
**Urgent:** purple spots, rapidly spreading rash with fever, or a very unwell child—seek medical care.`
  },
];
