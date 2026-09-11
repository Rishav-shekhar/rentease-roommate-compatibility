export type Option = { label: string; value: number };
export type Question = {
  id: string;
  prompt: string;
  helper?: string;
  weight: number;
  options: Option[];
  /**
   * How harshly a gap between two answers should be treated, beyond plain
   * numeric distance. Applied as diff = rawDiff ** sensitivity.
   * < 1  → even a small gap counts as a real mismatch (dealbreaker-style,
   *        e.g. smoking indoors vs. not).
   * = 1  → linear, a gap matters proportionally to its size (default).
   * > 1  → forgiving, only a big gap really counts (e.g. temperature/food,
   *        where lifestyles can differ without causing friction).
   */
  sensitivity?: number;
};

export const QUESTIONS: Question[] = [
  {
    id: "sleep",
    prompt: "What's your sleep schedule like?",
    weight: 1.2,
    options: [
      { label: "Early bird, asleep by 10", value: 0 },
      { label: "Asleep by midnight, mostly", value: 1 },
      { label: "Up until 1–2am usually", value: 2 },
      { label: "True night owl, 3am is normal", value: 3 },
    ],
  },
  {
    id: "clean",
    prompt: "How tidy do you keep shared spaces?",
    weight: 1.5,
    sensitivity: 0.8, // a tidiness gap tends to bite harder than it looks on paper
    options: [
      { label: "Spotless, always", value: 0 },
      { label: "Clean, a little mess is fine", value: 1 },
      { label: "Lived-in, I'll clean it eventually", value: 2 },
      { label: "Mess doesn't bother me much", value: 3 },
    ],
  },
  {
    id: "noise",
    prompt: "How do you feel about noise at home?",
    weight: 1.1,
    options: [
      { label: "I need it quiet, mostly", value: 0 },
      { label: "Some background noise is fine", value: 1 },
      { label: "Music, calls, TV — normal life", value: 2 },
      { label: "The louder the better, honestly", value: 3 },
    ],
  },
  {
    id: "guests",
    prompt: "How often do you have people over?",
    weight: 1.0,
    options: [
      { label: "Rarely, I like my space", value: 0 },
      { label: "Occasionally, with a heads-up", value: 1 },
      { label: "Pretty often, friends drop by", value: 2 },
      { label: "My place is basically the hangout spot", value: 3 },
    ],
  },
  {
    id: "wfh",
    prompt: "Do you work or study from home?",
    weight: 0.9,
    options: [
      { label: "Rarely, I'm out most of the day", value: 0 },
      { label: "A day or two a week", value: 1 },
      { label: "Most days, need it quiet-ish", value: 2 },
      { label: "Always home, need real focus time", value: 3 },
    ],
  },
  {
    id: "smoking",
    prompt: "Where do you stand on smoking or vaping indoors?",
    weight: 1.4,
    sensitivity: 0.5, // even a small gap here tends to be a real dealbreaker
    options: [
      { label: "Strictly no, not even on the balcony", value: 0 },
      { label: "Balcony or outside only", value: 1 },
      { label: "Doesn't bother me much", value: 2 },
      { label: "I smoke/vape and that's non-negotiable", value: 3 },
    ],
  },
  {
    id: "food",
    prompt: "How do you feel about sharing food and kitchen stuff?",
    weight: 0.8,
    sensitivity: 1.5, // easy to work around with a shelf rule, so gaps matter less
    options: [
      { label: "Everything strictly separate", value: 0 },
      { label: "Ask before you touch my stuff", value: 1 },
      { label: "Casual sharing is fine", value: 2 },
      { label: "What's mine is yours, cook together even", value: 3 },
    ],
  },
  {
    id: "temp",
    prompt: "AC or no AC — where's your comfort zone?",
    weight: 0.7,
    sensitivity: 1.6, // a thermostat gap is annoying, rarely a real conflict
    options: [
      { label: "Cold room, always", value: 0 },
      { label: "AC on when it's hot", value: 1 },
      { label: "Prefer natural airflow mostly", value: 2 },
      { label: "Barely ever use AC", value: 3 },
    ],
  },
  {
    id: "chores",
    prompt: "How should chores get split?",
    weight: 1.3,
    sensitivity: 0.85,
    options: [
      { label: "Strict rotating schedule", value: 0 },
      { label: "Rough system, flexible week to week", value: 1 },
      { label: "Whoever notices it, does it", value: 2 },
      { label: "I'd rather just pay for a cleaner", value: 3 },
    ],
  },
  {
    id: "nights",
    prompt: "What does a typical weeknight look like for you?",
    weight: 1.0,
    options: [
      { label: "Home, quiet, in bed early", value: 0 },
      { label: "Home but doing my own thing", value: 1 },
      { label: "Out a couple nights a week", value: 2 },
      { label: "Rarely home before midnight", value: 3 },
    ],
  },
];

export type Answers = Record<string, number>;

export function encodeAnswers(answers: Answers): string {
  const arr = QUESTIONS.map((q) => answers[q.id] ?? 0);
  const json = JSON.stringify(arr);
  if (typeof window === "undefined") return Buffer.from(json).toString("base64url");
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(code: string | null): Answers | null {
  if (!code) return null;
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof window === "undefined" ? Buffer.from(b64, "base64").toString("utf-8") : atob(b64);
    const arr = JSON.parse(json) as number[];
    const answers: Answers = {};
    QUESTIONS.forEach((q, i) => (answers[q.id] = arr[i] ?? 0));
    return answers;
  } catch {
    return null;
  }
}

export type QuestionResult = {
  question: Question;
  diff: number; // 0..1 normalized
  match: number; // 0..100
};

export type ScoreResult = {
  percent: number;
  strong: QuestionResult[];
  friction: QuestionResult[];
  perQuestion: QuestionResult[];
};

export function scoreCompatibility(a: Answers, b: Answers): ScoreResult {
  const maxVal = 3;
  let weightedSum = 0;
  let totalWeight = 0;
  const perQuestion: QuestionResult[] = [];

  for (const q of QUESTIONS) {
    const va = a[q.id] ?? 0;
    const vb = b[q.id] ?? 0;
    const rawDiff = Math.abs(va - vb) / maxVal;
    const diff = Math.min(1, Math.pow(rawDiff, q.sensitivity ?? 1));
    const match = Math.round((1 - diff) * 100);
    weightedSum += q.weight * (1 - diff);
    totalWeight += q.weight;
    perQuestion.push({ question: q, diff, match });
  }

  const percent = Math.round((weightedSum / totalWeight) * 100);
  const sorted = [...perQuestion].sort((x, y) => x.diff - y.diff);
  const strong = sorted.filter((r) => r.diff <= 0.34).slice(0, 5);
  const friction = [...sorted].reverse().filter((r) => r.diff >= 0.34).slice(0, 5);

  return { percent, strong, friction, perQuestion };
}

export function interpretation(percent: number): string {
  if (percent >= 85) return "You two are scary aligned. Move-in day should be easy.";
  if (percent >= 70) return "Solidly compatible — a few things to talk through, nothing dramatic.";
  if (percent >= 50) return "Workable, but set some ground rules early to avoid friction.";
  return "Your habits pull in pretty different directions — worth a real conversation before signing anything.";
}
