import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "Invalid or missing userIds" }, { status: 400 });
    }

    const users = await Promise.all(
      userIds.map(async (id) => {
        try {
          const user = await clerk.users.getUser(id);
          return {
            id,
            fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
            username: user.username ?? "",
          };
        } catch {
          return { id, fullName: null, username: null }; // Graceful fallback
        }
      })
    );

    const result: Record<string, { fullName: string | null; username: string | null }> = {};
    for (const u of users) {
      result[u.id] = { fullName: u.fullName, username: u.username };
    }

    return NextResponse.json(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
