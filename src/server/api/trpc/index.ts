import { eventRouter } from "./routers/event";
import { availabilityRouter } from "./routers/availability";
import { router } from "@/server/api/trpc/trpc";
import { defaultAvailabilityRouter } from "@/server/api/trpc/routers/defaultAvailability";

export const appRouter = router({
  event: eventRouter,
  availability: availabilityRouter,
  defaultAvailability: defaultAvailabilityRouter,
});

export type AppRouter = typeof appRouter;
