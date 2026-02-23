import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Conflict tickets - the main dispute container
  conflicts: defineTable({
    title: v.string(),
    category: v.union(
      v.literal("couple"),
      v.literal("roommates"),
      v.literal("colleagues"),
      v.literal("friends"),
      v.literal("other")
    ),
    description: v.string(),
    creatorId: v.id("users"),
    joinCode: v.string(),
    status: v.union(
      v.literal("gathering"),
      v.literal("analyzing"),
      v.literal("resolved")
    ),
    resolution: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_join_code", ["joinCode"])
    .index("by_status", ["status"]),

  // Participants in a conflict
  participants: defineTable({
    conflictId: v.id("conflicts"),
    userId: v.id("users"),
    role: v.string(), // e.g., "Party A", "Party B", etc.
    hasSubmitted: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_conflict", ["conflictId"])
    .index("by_user", ["userId"])
    .index("by_conflict_and_user", ["conflictId", "userId"]),

  // Initial questions asked during signup for context
  conflictQuestions: defineTable({
    conflictId: v.id("conflicts"),
    participantId: v.id("participants"),
    question: v.string(),
    answer: v.string(),
    questionOrder: v.number(),
  })
    .index("by_conflict", ["conflictId"])
    .index("by_participant", ["participantId"]),

  // Each party's perspective (kept private until resolution)
  perspectives: defineTable({
    conflictId: v.id("conflicts"),
    participantId: v.id("participants"),
    whatHappened: v.string(),
    howItMadeYouFeel: v.string(),
    whatYouNeed: v.string(),
    willingToCompromise: v.string(),
    idealOutcome: v.string(),
    submittedAt: v.number(),
  })
    .index("by_conflict", ["conflictId"])
    .index("by_participant", ["participantId"]),
});
