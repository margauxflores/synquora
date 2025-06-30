import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  try {
    const user = await clerk.users.getUser(userId);

    return NextResponse.json({
      fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
      username: user.username,
    });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
