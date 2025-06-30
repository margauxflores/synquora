import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/trpc";
import { NextRequest } from "next/server";
import { createContext } from "@/server/api/trpc/context";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`, error);
    },
  });

export { handler as GET, handler as POST };
