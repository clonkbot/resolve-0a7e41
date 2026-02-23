import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submit = mutation({
  args: {
    conflictId: v.id("conflicts"),
    whatHappened: v.string(),
    howItMadeYouFeel: v.string(),
    whatYouNeed: v.string(),
    willingToCompromise: v.string(),
    idealOutcome: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find participant record
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) throw new Error("Not a participant in this conflict");

    // Check if already submitted
    const existing = await ctx.db
      .query("perspectives")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .first();

    if (existing) {
      // Update existing perspective
      await ctx.db.patch(existing._id, {
        whatHappened: args.whatHappened,
        howItMadeYouFeel: args.howItMadeYouFeel,
        whatYouNeed: args.whatYouNeed,
        willingToCompromise: args.willingToCompromise,
        idealOutcome: args.idealOutcome,
        submittedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("perspectives", {
        conflictId: args.conflictId,
        participantId: participant._id,
        whatHappened: args.whatHappened,
        howItMadeYouFeel: args.howItMadeYouFeel,
        whatYouNeed: args.whatYouNeed,
        willingToCompromise: args.willingToCompromise,
        idealOutcome: args.idealOutcome,
        submittedAt: Date.now(),
      });
    }

    // Mark as submitted
    await ctx.db.patch(participant._id, { hasSubmitted: true });

    return { success: true };
  },
});

export const getMyPerspective = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) return null;

    const perspective = await ctx.db
      .query("perspectives")
      .withIndex("by_participant", (q) => q.eq("participantId", participant._id))
      .first();

    return perspective;
  },
});

export const getAllForResolution = query({
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

    const conflict = await ctx.db.get(args.conflictId);
    if (!conflict) return null;

    // Get all perspectives for this conflict
    const perspectives = await ctx.db
      .query("perspectives")
      .withIndex("by_conflict", (q) => q.eq("conflictId", args.conflictId))
      .collect();

    // Get all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_conflict", (q) => q.eq("conflictId", args.conflictId))
      .collect();

    // Combine perspectives with participant roles (anonymized)
    const anonymizedPerspectives = perspectives.map((p) => {
      const participant = participants.find((part) => part._id === p.participantId);
      return {
        role: participant?.role || "Unknown",
        whatHappened: p.whatHappened,
        howItMadeYouFeel: p.howItMadeYouFeel,
        whatYouNeed: p.whatYouNeed,
        willingToCompromise: p.willingToCompromise,
        idealOutcome: p.idealOutcome,
      };
    });

    return {
      conflict: {
        title: conflict.title,
        category: conflict.category,
        description: conflict.description,
      },
      perspectives: anonymizedPerspectives,
      allSubmitted: participants.every((p) => p.hasSubmitted),
      participantCount: participants.length,
      submittedCount: perspectives.length,
    };
  },
});
