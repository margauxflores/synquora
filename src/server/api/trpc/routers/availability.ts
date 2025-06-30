import { z } from "zod";
import { db } from "@/lib/drizzle/client";
import { availabilities } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "@/server/api/trpc/trpc";

const availabilityInput = z.object({
  eventId: z.string().uuid(),
  userId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string(),
});

export const availabilityRouter = router({
  listByEventAndUser: publicProcedure
    .input(z.object({ eventId: z.string().uuid(), userId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(availabilities)
        .where(
          and(eq(availabilities.eventId, input.eventId), eq(availabilities.userId, input.userId))
        );
    }),

  listByEvent: publicProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(availabilities).where(eq(availabilities.eventId, input.eventId));
    }),

  create: publicProcedure.input(availabilityInput).mutation(async ({ input }) => {
    await db.insert(availabilities).values({
      ...input,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
    });
  }),

  delete: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    await db.delete(availabilities).where(eq(availabilities.id, input.id));
  }),

  saveAvailability: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        timezone: z.string(),
        slots: z.array(
          z.object({
            startTime: z.string().datetime(),
            endTime: z.string().datetime(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      await db
        .delete(availabilities)
        .where(and(eq(availabilities.userId, userId), eq(availabilities.eventId, input.eventId)));

      if (input.slots.length > 0) {
        await db.insert(availabilities).values(
          input.slots.map((slot) => ({
            eventId: input.eventId,
            userId,
            timezone: input.timezone,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
          }))
        );
      }

      return { success: true };
    }),
});
