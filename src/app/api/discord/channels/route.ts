import { NextRequest, NextResponse } from "next/server";

type DiscordChannel = {
  id: string;
  name: string;
  type: number; // 2 = Voice, 13 = Stage
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const GUILD_ID = process.env.DISCORD_GUILD_ID;
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

  if (!GUILD_ID || !BOT_TOKEN) {
    return NextResponse.json(
      { error: "Missing DISCORD_GUILD_ID or DISCORD_BOT_TOKEN" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error }, { status: res.status });
    }

    const allChannels: DiscordChannel[] = await res.json();

    const relevantChannels = allChannels
      .filter((ch) => ch.type === 2 || ch.type === 13)
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type === 2 ? "Voice" : "Stage",
      }));

    return NextResponse.json(relevantChannels);
  } catch (err) {
    console.error("Failed to fetch Discord channels:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
