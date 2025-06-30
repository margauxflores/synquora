import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { type inferAsyncReturnType } from "@trpc/server";
import { createContext } from "@/server/api/trpc/context";

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        userId: ctx.userId,
      },
    });
  })
);
