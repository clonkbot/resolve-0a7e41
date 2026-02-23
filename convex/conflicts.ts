import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const create = mutation({
  args: {
    title: v.string(),
    category: v.union(
      v.literal("couple"),
      v.literal("roommates"),
      v.literal("colleagues"),
      v.literal("friends"),
      v.literal("other")
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const joinCode = generateJoinCode();

    const conflictId = await ctx.db.insert("conflicts", {
      title: args.title,
      category: args.category,
      description: args.description,
      creatorId: userId,
      joinCode,
      status: "gathering",
      createdAt: Date.now(),
    });

    // Auto-add creator as first participant
    await ctx.db.insert("participants", {
      conflictId,
      userId,
      role: "Party A",
      hasSubmitted: false,
      joinedAt: Date.now(),
    });

    return { conflictId, joinCode };
  },
});

export const join = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conflict = await ctx.db
      .query("conflicts")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase()))
      .first();

    if (!conflict) throw new Error("Invalid join code");
    if (conflict.status !== "gathering") throw new Error("This conflict is no longer accepting participants");

    // Check if already a participant
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", conflict._id).eq("userId", userId)
      )
      .first();

    if (existing) {
      return { conflictId: conflict._id, alreadyJoined: true };
    }

    // Count existing participants to assign role
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_conflict", (q) => q.eq("conflictId", conflict._id))
      .collect();

    const roleLetters = ["A", "B", "C", "D", "E", "F"];
    const role = `Party ${roleLetters[participants.length] || participants.length + 1}`;

    await ctx.db.insert("participants", {
      conflictId: conflict._id,
      userId,
      role,
      hasSubmitted: false,
      joinedAt: Date.now(),
    });

    return { conflictId: conflict._id, alreadyJoined: false };
  },
});

export const get = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const conflict = await ctx.db.get(args.conflictId);
    if (!conflict) return null;

    // Check if user is a participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) return null;

    return { ...conflict, currentParticipant: participant };
  },
});

export const getByJoinCode = query({
  args: { joinCode: v.string() },
  handler: async (ctx, args) => {
    const conflict = await ctx.db
      .query("conflicts")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase()))
      .first();

    if (!conflict) return null;

    // Return limited info for preview
    return {
      _id: conflict._id,
      title: conflict.title,
      category: conflict.category,
      status: conflict.status,
    };
  },
});

export const listMyConflicts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const conflicts = await Promise.all(
      participations.map(async (p) => {
        const conflict = await ctx.db.get(p.conflictId);
        if (!conflict) return null;

        const allParticipants = await ctx.db
          .query("participants")
          .withIndex("by_conflict", (q) => q.eq("conflictId", p.conflictId))
          .collect();

        const submittedCount = allParticipants.filter((ap) => ap.hasSubmitted).length;

        return {
          ...conflict,
          myRole: p.role,
          participantCount: allParticipants.length,
          submittedCount,
          hasSubmitted: p.hasSubmitted,
        };
      })
    );

    return conflicts.filter((c) => c !== null).sort((a, b) => b!.createdAt - a!.createdAt);
  },
});

export const getParticipants = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user is a participant
    const myParticipation = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!myParticipation) return [];

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_conflict", (q) => q.eq("conflictId", args.conflictId))
      .collect();

    // Return anonymized participant info
    return participants.map((p) => ({
      _id: p._id,
      role: p.role,
      hasSubmitted: p.hasSubmitted,
      isMe: p.userId === userId,
    }));
  },
});

export const setResolution = mutation({
  args: {
    conflictId: v.id("conflicts"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conflict = await ctx.db.get(args.conflictId);
    if (!conflict) throw new Error("Conflict not found");

    // Verify user is a participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_conflict_and_user", (q) =>
        q.eq("conflictId", args.conflictId).eq("userId", userId)
      )
      .first();

    if (!participant) throw new Error("Not a participant");

    await ctx.db.patch(args.conflictId, {
      resolution: args.resolution,
      status: "resolved",
    });
  },
});
