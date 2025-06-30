import { z } from "zod";
import { router, publicProcedure } from "@/server/api/trpc/trpc";
import { db } from "@/lib/drizzle/client";
import { defaultAvailabilities } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export const defaultAvailabilityInput = z.array(
  z.object({
    day: z.number().min(0).max(6),
    hour: z.number().min(0).max(23),
  })
);

export const defaultAvailabilityRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) throw new Error("Unauthorized");

    return db
      .select()
      .from(defaultAvailabilities)
      .where(eq(defaultAvailabilities.userId, ctx.userId));
  }),

  set: publicProcedure.input(defaultAvailabilityInput).mutation(async ({ ctx, input }) => {
    if (!ctx.userId) throw new Error("Unauthorized");

    await db.delete(defaultAvailabilities).where(eq(defaultAvailabilities.userId, ctx.userId));

    if (input.length > 0) {
      await db.insert(defaultAvailabilities).values(
        input.map(({ day, hour }) => ({
          userId: ctx.userId!,
          day,
          hour,
        }))
      );
    }
  }),
});
