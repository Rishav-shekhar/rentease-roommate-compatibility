export const FUN_FACTS = [
  "The #1 roommate fight isn't rent — it's dishes left \"to soak.\"",
  "A shared spice rack has ended more friendships than bad breakups.",
  "Nothing bonds roommates faster than a 2am fire-alarm false alarm.",
  "Label your leftovers and you're already winning at roommate life.",
  "The group chat where you split bills becomes a whole personality.",
  "One loud roommate plus one light sleeper equals a very specific kind of chaos.",
  "Whoever buys the good toilet paper first sets the household standard.",
  "A clean sink says more about compatibility than any quiz could.",
  "Guest-count etiquette is the silent rulebook every shared home runs on.",
  "The thermostat is where most roommate diplomacy actually happens.",
];

export function quoteForSeed(seed: number): string {
  const len = FUN_FACTS.length;
  const i = ((seed % len) + len) % len;
  return FUN_FACTS[i];
}
