import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Contextual questions based on conflict category
const CATEGORY_QUESTIONS: Record<string, string[]> = {
  couple: [
    "How long have you been together?",
    "Is this a recurring issue or a new situation?",
    "Have you tried discussing this before? What happened?",
    "On a scale of 1-10, how important is resolving this to you?",
    "What's one positive thing about your relationship you want to preserve?",
  ],
  roommates: [
    "How long have you been living together?",
    "Is there a lease or agreement involved?",
    "Has this affected your daily routine or comfort at home?",
    "Have you had house meetings or discussions about this before?",
    "What would make your living situation feel harmonious?",
  ],
  colleagues: [
    "How long have you worked together?",
    "Does this conflict affect your work performance or the team?",
    "Is management or HR aware of this situation?",
    "What's the professional relationship like outside of this issue?",
    "What would a productive working relationship look like?",
  ],
  friends: [
    "How long have you known each other?",
    "Is this conflict affecting your mutual friend group?",
    "Have you taken any breaks from the friendship before?",
    "What aspects of this friendship are worth preserving?",
    "What would make you feel the friendship is back on track?",
  ],
  other: [
    "How did you come to know the other party?",
    "How long has this conflict been going on?",
    "Are there any third parties affected by this situation?",
    "What have you tried so far to resolve this?",
    "What does a positive resolution look like to you?",
  ],
};

export const getQuestionsForCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return CATEGORY_QUESTIONS[args.category] || CATEGORY_QUESTIONS.other;
  },
});

export const submitAnswers = mutation({
  args: {
    conflictId: v.id("conflicts"),
    answers: v.array(v.object({
      question: v.string(),
      answer: v.string(),
      questionOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) throw new Error("Not a participant");

    // Delete existing answers for this participant
    const existing = await ctx.db
      .query("conflictQuestions")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .collect();

    for (const q of existing) {
      await ctx.db.delete(q._id);
    }

    // Insert new answers
    for (const answer of args.answers) {
      await ctx.db.insert("conflictQuestions", {
        conflictId: args.conflictId,
        participantId: participant._id,
        question: answer.question,
        answer: answer.answer,
        questionOrder: answer.questionOrder,
      });
    }

    return { success: true };
  },
});

export const getMyAnswers = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) return [];

    return await ctx.db
      .query("conflictQuestions")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .collect();
  },
});

export const getAllAnswersForResolution = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Verify user is a participant
    const myParticipation = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!myParticipation) return null;

    const allQuestions = await ctx.db
      .query("conflictQuestions")
      .withIndex("by_conflict", (q) => q.eq("conflictId", args.conflictId))
      .collect();

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_conflict", (q) => q.eq("conflictId", args.conflictId))
      .collect();

    // Group by participant role
    const grouped: Record<string, Array<{ question: string; answer: string }>> = {};

    for (const q of allQuestions) {
      const participant = participants.find((p) => p._id === q.participantId);
      const role = participant?.role || "Unknown";
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push({ question: q.question, answer: q.answer });
    }

    return grouped;
  },
});
