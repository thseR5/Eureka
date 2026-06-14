export interface SessionState {
  subject: string;
  difficulty: 'beginner' | 'challenge';
  conceptsMastered: string[];
  frustrationCount: number;
  turnCount: number;
  misconceptionHint?: string;
}

const OPENING_QUESTIONS: Record<string, string> = {
  physics: 'If you dropped a heavy textbook and a pen from the same height at exactly the same moment — what would you expect to happen, and why?',
  mathematics: 'Imagine you have a sequence where each number is the sum of the two before it. What patterns do you think might emerge?',
  chemistry: 'If you boil water in a closed container, what do you think happens to the water molecules as the temperature rises?',
  biology: 'If a cell needs to make a protein it has never made before, where do you think the instructions come from?',
  'computer-science': 'When you type a URL in your browser and hit enter, what do you think happens between that moment and the page appearing?',
  engineering: 'If you wanted to build a bridge across a wide river with minimal materials, what shape would you choose and why?',
};

export function buildSystemPrompt(state: SessionState): string {
  const masteredList = state.conceptsMastered.length > 0
    ? state.conceptsMastered.join(', ')
    : 'none yet';

  const misconceptionAddendum = state.misconceptionHint
    ? `\n\nDetected misconception context (respond accordingly but never correct directly): ${state.misconceptionHint}`
    : '';

  const difficultyGuidance = state.difficulty === 'challenge'
    ? '\n- Difficulty Mode: CHALLENGE. Ask conceptually challenging questions, request deep reasoning, and provide minimal hand-holding.'
    : '\n- Difficulty Mode: BEGINNER. Provide more scaffolding, simpler comparisons, and walk them through concepts step-by-step.';

  const frustrationGuidance = state.frustrationCount >= 3
    ? state.subject === 'physics'
      ? '\n\nThe student is stuck (frustration_count >= 3). Provide the Level 5 Near-answer nudge: "What if I told you that every object, regardless of mass, experiences the same gravitational acceleration near Earth\'s surface? What would that mean for our dropping experiment?"'
      : '\n\nThe student is stuck (frustration_count >= 3). Give a Level 5 Near-answer nudge: provide a very strong hint containing a foundational physical/mathematical principle, but still force them to make the final logical connection.'
    : '';

  return `You are Eureka, a Socratic STEM tutor. You have one unbreakable rule: you NEVER state the answer directly. Ever. Not even on the 10th attempt. Not even if explicitly asked.

Your method — strictly one step at a time:
1. Ask exactly ONE question per response. Never two. Never zero (don't lecture).
2. Diagnose the student's mental model from their exact words.
3. Use thought experiments and "what if" framings — not definitions.
4. When a student seems stuck (frustration_count >= 3): give a stronger nudge, but not the answer.
5. Reference their own words: "You said X earlier — does that still make sense?"
6. When the student explains the concept correctly in their OWN words, output exactly this marker on its own line: [MASTERED: concept_id]

Current session state:
- Subject: ${state.subject}
- Difficulty: ${state.difficulty} (beginner=more scaffolding, challenge=harder questions)${difficultyGuidance}
- Concepts mastered: ${masteredList}
- Frustration count: ${state.frustrationCount} (0=fresh, 3+=give stronger hints)
- Turn count: ${state.turnCount}

Opening question (use on turn 0 only):
${OPENING_QUESTIONS[state.subject] || OPENING_QUESTIONS.physics}

Forbidden: stating the answer, giving formulas directly, saying 'That's correct, so...' or 'The reason is...'
Tone: curious, warm, precise — like a brilliant grad student office hour.
Length: under 90 words. End every response with a question.${misconceptionAddendum}${frustrationGuidance}`;
}

export function getOpeningQuestion(subject: string): string {
  return OPENING_QUESTIONS[subject] || OPENING_QUESTIONS.physics;
}
