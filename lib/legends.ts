/**
 * Legend prompts — classic prompt archetypes that produced famously wild results.
 * These are long-circulating public patterns, NOT quotes from any product or person.
 * No provenance is claimed: each card says what the pattern does and why it works.
 * Users copy them and run them on their own top-ranked model.
 */
export interface Legend {
  id: string;
  title: string;
  tag: string;
  /** Era framing, e.g. "Sonnet-era flex" — the vibe of its release-day moment, never a claim about who posted what. */
  era: string;
  does: string;
  why: string;
  taskId: string;
  difficulty: "Easy" | "Medium" | "Spicy";
  prompt: string;
}

export const LEGENDS: Legend[] = [
  {
    id: "one-file-site",
    title: "The One-File Website",
    tag: "classic builder",
    era: "Sonnet-era flex",
    does: "A whole landing page — layout, copy, style — as one HTML file you can open instantly.",
    why: "Constraining output to a single file forces completeness; the model can't hand-wave the wiring.",
    taskId: "website",
    difficulty: "Easy",
    prompt: `Build a complete landing page for a neighborhood taco truck called "Midnight Taco" as ONE self-contained HTML file with inline CSS. Sections: hero with headline + order button, menu (6 items with prices), hours + location, 3 reviews, footer. Dark theme, big type, mobile-friendly. All copy original. Then tell me the 3 weakest parts of your own design.`
  },
  {
    id: "adventure-engine",
    title: "Choose-Your-Own-Adventure Engine",
    tag: "classic interactive",
    era: "early frontier era",
    does: "An endless text adventure that reacts to your choices, A/B/C style.",
    why: "Explicit state rules ('track health, gold, location') stop the story from drifting or cheating.",
    taskId: "game",
    difficulty: "Easy",
    prompt: `Run a text adventure: I'm a lighthouse keeper on a cliff during a storm, and the light just went out. Rules: always end with exactly 3 lettered choices (A/B/C); track my health, lantern oil, and clues found, and show them every turn; never break character; never resolve the mystery before turn 10. Start now.`
  },
  {
    id: "svg-in-one-shot",
    title: "SVG Art in One Reply",
    tag: "classic flex",
    era: "early frontier era",
    does: "Raw SVG code that renders as actual art — no image model involved.",
    why: "Code-output models can 'draw' when you demand primitives (circles, gradients) instead of vibes.",
    taskId: "image",
    difficulty: "Medium",
    prompt: `Reply with ONLY raw SVG code, no explanation: a sunset over mountains with a lake reflection, 800x600. Use gradients, at least 20 shapes, layered depth (sky, far peaks, near peaks, lake, foreground). I will render it directly.`
  },
  {
    id: "council-debate",
    title: "The Council Debate",
    tag: "classic reasoning",
    era: "Sonnet-era flex",
    does: "Three expert personas argue your idea from opposite sides, then vote.",
    why: "Forced disagreement beats sycophancy — the default 'great idea!' dies in committee.",
    taskId: "research",
    difficulty: "Medium",
    prompt: `My idea: a subscription that mails you a mystery plant every month. Debate it as a council of three: a skeptical accountant, a hype-fueled marketer, and a plant biologist. Each gives one killer argument and one fatal flaw. Then they vote and the majority writes the verdict in 3 sentences. No fence-sitting.`
  },
  {
    id: "socratic-tutor",
    title: "The Socratic Tutor",
    tag: "classic learning",
    era: "timeless",
    does: "Teaches without ever giving the answer — only questions until you get it.",
    why: "Withholding the answer is the whole trick; one sentence ('never state the final answer') changes everything.",
    taskId: "research",
    difficulty: "Easy",
    prompt: `Teach me how loans and interest work. Rules: NEVER state the final answer or formula outright — only ask me one question at a time, confirm or correct my reply, then go deeper. If I'm wrong twice in a row, give a smaller hint. Start with your first question.`
  },
  {
    id: "senior-review",
    title: "Senior-Engineer Code Review",
    tag: "classic coding",
    era: "Sonnet-era flex",
    does: "Your pasted code comes back graded like a strict senior would — bugs, smells, fixes.",
    why: "A role + a rubric ('correctness, readability, edge cases') turns vague feedback into a checklist.",
    taskId: "coding",
    difficulty: "Easy",
    prompt: `You are a strict senior engineer. Review this code for: 1) bugs, 2) edge cases, 3) readability. Paste it back below. Grade each category 1-10, list every issue as file:line + one-line fix, then show the single most important fixed snippet. Code:\n\n[paste your code here]`
  },
  {
    id: "five-then-expert",
    title: "Five, Then Expert",
    tag: "classic explainer",
    era: "timeless",
    does: "Any topic twice: first like you're five, then like you're a grad student.",
    why: "The simple version exposes whether the model actually understands it; the expert version adds the real depth.",
    taskId: "writing",
    difficulty: "Easy",
    prompt: `Explain how GPS knows where I am. First in 4 sentences a 5-year-old gets (one analogy required). Then the same thing for an engineering grad student (signals, trilateration, clock error — 150 words max). End with the one misconception most people have.`
  },
  {
    id: "tiny-roguelike",
    title: "Tiny Roguelike in Chat",
    tag: "classic game",
    era: "early frontier era",
    does: "A playable dungeon crawl with ASCII map, HP, and loot — all in text.",
    why: "ASCII + tracked state turns chat into a game engine; short turns keep it playable.",
    taskId: "game",
    difficulty: "Spicy",
    prompt: `Run a tiny roguelike. Show a 10x10 ASCII map each turn (@ = me, # = wall, E = enemy, $ = loot). I move with WASD words (up/down/left/right). Track HP (start 10) and gold. Enemies move toward me each turn; bumping one deals 1-3 damage both ways. 3 rooms, stairs (>) in room 3 ends the run with my score. Keep turns short. Start room 1.`
  },
  {
    id: "arcade-clone",
    title: "One-File Arcade Clone",
    tag: "release-day flex",
    era: "Sonnet-era flex",
    does: "A tiny Sonic-style speed runner — rings, loops, score — as one HTML file with zero assets.",
    why: "This was the 'no way it just did that' demo of the Sonnet era: game feel from pure code, and it still impresses today.",
    taskId: "game",
    difficulty: "Spicy",
    prompt: `Build a tiny Sonic-STYLE (original character and art only, nothing copied) 2D speed-runner as ONE self-contained HTML file with inline JS and canvas. Blue skies, checkered ground, gold rings to collect, one loop-the-loop, a jump (spacebar) and a spin-dash (hold down + space). Score = rings + speed bonus. Game over screen with restart. All art drawn in code, no external files. Then list the 2 jankiest mechanics you'd fix first.`
  }
];
