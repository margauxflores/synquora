import { baseUrl } from "@/lib/consts";

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const announcementChannelId = process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID;

if (!token || !guildId || !announcementChannelId) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in environment variables");
}

export type CreateEventOptions = {
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location: string;
  channelId?: string;
};

// Create a scheduled event (external or with voice/stage channel)
export async function createDiscordScheduledEvent({
  name,
  description,
  startTime,
  endTime,
  location,
  channelId,
}: CreateEventOptions) {
  const body = {
    name,
    description,
    scheduled_start_time: startTime.toISOString(),
    scheduled_end_time: endTime.toISOString(),
    entity_type: channelId ? 2 : 3, // 2 = Voice/Stage, 3 = External
    channel_id: channelId,
    entity_metadata: channelId ? undefined : { location },
    privacy_level: 2,
  };

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/scheduled-events`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("❌ Failed to create Discord event:", error);
    throw new Error("Failed to create Discord scheduled event");
  }

  const data = await res.json();
  return data;
}

// Delete a scheduled Discord event by ID
export async function deleteDiscordEvent(eventId: string) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Failed to delete Discord event:", text);
    throw new Error(`Failed to delete Discord event: ${res.status}`);
  }
}

export async function postEventAnnouncement(event: {
  name: string;
  id: string;
  description?: string | null;
  scheduledStartTime: Date;
  discordEventId?: string | null;
}) {
  const timestamp = Math.floor(event.scheduledStartTime.getTime() / 1000);

  const nativeDiscordLink =
    event.discordEventId && guildId
      ? `https://discord.com/events/${guildId}/${event.discordEventId}`
      : `${baseUrl}/events/${event.id}`; // fallback

  const res = await fetch(
    `https://discord.com/api/v10/channels/${announcementChannelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `@everyone\n📢 **${event.name}** is happening <t:${timestamp}:F>!\n${nativeDiscordLink}`,
        allowed_mentions: { parse: ["everyone"] },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("❌ Failed to post announcement:", error);
    throw new Error("Failed to post Discord event announcement");
  }
}
