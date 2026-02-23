import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateResolution = action({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    // Get all perspectives
    const perspectiveData = await ctx.runQuery(api.perspectives.getAllForResolution, {
      conflictId: args.conflictId,
    });

    if (!perspectiveData) {
      throw new Error("Could not retrieve conflict data");
    }

    if (!perspectiveData.allSubmitted) {
      throw new Error("Not all participants have submitted their perspectives");
    }

    // Get contextual answers
    const contextAnswers = await ctx.runQuery(api.questions.getAllAnswersForResolution, {
      conflictId: args.conflictId,
    });

    // Build a comprehensive prompt
    const { conflict, perspectives } = perspectiveData;

    let contextSection = "";
    if (contextAnswers) {
      contextSection = "\n\n## Contextual Background:\n";
      for (const [role, answers] of Object.entries(contextAnswers)) {
        contextSection += `\n### ${role}'s Context:\n`;
        for (const qa of answers) {
          contextSection += `- ${qa.question}\n  Answer: ${qa.answer}\n`;
        }
      }
    }

    const perspectivesSection = perspectives
      .map(
        (p) => `
### ${p.role}'s Perspective:

**What happened from their view:**
${p.whatHappened}

**How it made them feel:**
${p.howItMadeYouFeel}

**What they need:**
${p.whatYouNeed}

**What they're willing to compromise on:**
${p.willingToCompromise}

**Their ideal outcome:**
${p.idealOutcome}
`
      )
      .join("\n---\n");

    // For now, generate a structured resolution template
    // In production, this would call an actual AI API
    const resolution = generateMediationResponse(conflict, perspectives, contextAnswers);

    // Save the resolution
    await ctx.runMutation(api.conflicts.setResolution, {
      conflictId: args.conflictId,
      resolution,
    });

    return { success: true, resolution };
  },
});

function generateMediationResponse(
  conflict: { title: string; category: string; description: string },
  perspectives: Array<{
    role: string;
    whatHappened: string;
    howItMadeYouFeel: string;
    whatYouNeed: string;
    willingToCompromise: string;
    idealOutcome: string;
  }>,
  contextAnswers: Record<string, Array<{ question: string; answer: string }>> | null
): string {
  const partyCount = perspectives.length;
  const categoryLabel = conflict.category.charAt(0).toUpperCase() + conflict.category.slice(1);

  // Analyze common themes and differences
  const needs = perspectives.map((p) => p.whatYouNeed);
  const compromises = perspectives.map((p) => p.willingToCompromise);
  const feelings = perspectives.map((p) => p.howItMadeYouFeel);

  return `# Mediation Resolution

## Conflict Overview
**Type:** ${categoryLabel} Conflict
**Parties Involved:** ${partyCount}
**Issue:** ${conflict.title}

---

## Understanding Each Side

${perspectives
  .map(
    (p) => `### ${p.role}
${p.role} is experiencing feelings of distress related to this situation. Their core need is: ${p.whatYouNeed.slice(0, 100)}${p.whatYouNeed.length > 100 ? "..." : ""}

They have shown willingness to work on: ${p.willingToCompromise.slice(0, 100)}${p.willingToCompromise.length > 100 ? "..." : ""}
`
  )
  .join("\n")}

---

## Key Observations

1. **Shared Concerns:** Both parties want to resolve this situation and have expressed willingness to find common ground.

2. **Communication Gap:** There appears to be a difference in how each party perceives the events and their impact.

3. **Emotional Investment:** All parties have genuine feelings about this conflict, which shows the relationship matters to them.

---

## Recommended Solutions

### Immediate Actions

1. **Acknowledge Each Other's Feelings**
   Each party should take time to genuinely listen to how the other feels without interrupting or defending. Validation doesn't mean agreement—it means understanding.

2. **Establish Clear Expectations**
   Create explicit agreements about the specific issues raised. Write them down so there's no ambiguity.

3. **Set Up Regular Check-ins**
   Schedule brief weekly conversations to address small concerns before they become bigger issues.

### Long-term Improvements

1. **Develop a Communication Protocol**
   Agree on how to raise concerns in the future. Consider using "I feel..." statements rather than accusations.

2. **Create Boundaries**
   Based on what each party has shared, establish clear boundaries that respect everyone's needs.

3. **Build Positive Interactions**
   Intentionally create positive experiences together to rebuild trust and goodwill.

---

## Compromise Framework

Based on what each party is willing to offer, here's a potential middle ground:

${perspectives
  .map(
    (p) => `- **${p.role}** has offered to: ${p.willingToCompromise.slice(0, 150)}${p.willingToCompromise.length > 150 ? "..." : ""}`
  )
  .join("\n")}

---

## Path Forward

1. Both parties should read this resolution privately first
2. Schedule a calm conversation to discuss these recommendations
3. Start with one small action each party can commit to this week
4. Revisit progress in 2 weeks

---

## Final Thoughts

Conflict is a natural part of any relationship. The fact that all parties engaged in this mediation process shows a genuine desire to find resolution. Remember:

- **It's okay to disagree** - What matters is how you handle disagreements
- **Progress over perfection** - Small improvements compound over time
- **Assume good intent** - Most conflicts arise from miscommunication, not malice

*This resolution was generated based on the perspectives shared by all parties. It aims to provide a balanced, neutral framework for moving forward together.*

---

*Mediation completed. We hope this helps bring clarity and peace to your situation.*`;
}
