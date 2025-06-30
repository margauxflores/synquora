import { getAuth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";

export const createContext = (req: NextRequest) => {
  const { userId } = getAuth(req);
  return { userId };
};
