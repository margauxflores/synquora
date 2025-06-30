import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc/trpc";
import { db } from "@/lib/drizzle/client";
import { events, eventParticipants } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { baseUrl } from "@/lib/consts";

const createEventInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const eventRouter = router({
  create: protectedProcedure.input(createEventInput).mutation(async ({ input, ctx }) => {
    const id = uuidv4();
    const [createdEvent] = await db
      .insert(events)
      .values({
        id,
        name: input.name,
        description: input.description,
        createdBy: ctx.userId, // ✅ restored
      })
      .returning();

    return createdEvent;
  }),

  list: publicProcedure.query(async () => {
    const all = await db.select().from(events);
    return all; // includes createdBy now
  }),

  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    return db.query.events.findFirst({
      where: eq(events.id, input.id),
      columns: {
        id: true,
        name: true,
        description: true,
        createdBy: true,
        createdAt: true,
        scheduledStartTime: true,
        scheduledEndTime: true,
        isLocked: true,
      },
    });
  }),

  join: publicProcedure
    .input(z.object({ eventId: z.string().uuid(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      await db.insert(eventParticipants).values({
        id,
        eventId: input.eventId,
        userId: input.userId,
      });
      return { success: true };
    }),

  scheduleEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        discordChannelId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await db.query.events.findFirst({
        where: (e, { eq }) => eq(e.id, input.eventId),
      });

      if (!event || event.createdBy !== ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let discordEventId: string | null = null;

      try {
        const { createDiscordScheduledEvent, postEventAnnouncement } = await import(
          "@/lib/discord"
        );

        const discordEvent = await createDiscordScheduledEvent({
          name: event.name,
          description: event.description ?? undefined,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          location: `${baseUrl}/events/${event.id}`,
          channelId: input.discordChannelId,
        });

        discordEventId = discordEvent.id;

        await postEventAnnouncement({
          name: event.name,
          id: event.id,
          description: event.description ?? undefined,
          scheduledStartTime: new Date(input.startTime),
          discordEventId, // ✅ must pass this
        });
      } catch (err) {
        console.error("❌ Failed to sync with Discord:", err);
      }

      await db
        .update(events)
        .set({
          scheduledStartTime: new Date(input.startTime),
          scheduledEndTime: new Date(input.endTime),
          discordEventId,
          isLocked: true,
        })
        .where(eq(events.id, input.eventId));

      return { success: true };
    }),

  unscheduleEvent: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const event = await db.query.events.findFirst({
        where: (e, { eq }) => eq(e.id, input.eventId),
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.createdBy !== ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (event.discordEventId) {
        try {
          const { deleteDiscordEvent } = await import("@/lib/discord");
          await deleteDiscordEvent(event.discordEventId);
        } catch (err) {
          console.error("❌ Failed to delete Discord event:", err);
        }
      }

      await db
        .update(events)
        .set({
          scheduledStartTime: null,
          scheduledEndTime: null,
          discordEventId: null,
          isLocked: false,
        })
        .where(eq(events.id, input.eventId));

      return { success: true };
    }),
});
