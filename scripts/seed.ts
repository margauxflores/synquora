/**
 * 🧪 Test Seed Script for Synquora
 *
 * This script is used to seed the database with example data
 * for local development and testing purposes only.
 * Replace user IDs with real Clerk user IDs in production.
 */

import "dotenv/config";
import { db } from "@/lib/drizzle/client";
import {
  events,
  eventParticipants,
  availabilities,
  defaultAvailabilities,
} from "@/lib/drizzle/schema";
import { v4 as uuidv4 } from "uuid";

console.log("🧼 Clearing existing data...");

await db.delete(availabilities);
await db.delete(eventParticipants);
await db.delete(events);
await db.delete(defaultAvailabilities);

console.log("✅ Cleared.");

console.log("🌱 Seeding...");

const users = [
  { userId: "user_tokyo", timezone: "Asia/Tokyo", label: "Tokyo" },
  { userId: "user_california", timezone: "America/Los_Angeles", label: "California" },
  { userId: "user_newyork", timezone: "America/New_York", label: "New York" },
];

const eventId = uuidv4();
await db.insert(events).values({
  id: eventId,
  name: "Global Synquora Sync",
  description: "Find a perfect overlap between timezones!",
  createdBy: users[0].userId,
});

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

for (const { userId, timezone, label } of users) {
  await db.insert(eventParticipants).values({ eventId, userId });

  // 🌐 Shared Overlap UTC 13:00–14:00
  const overlapStartUTC = new Date(tomorrow);
  overlapStartUTC.setUTCHours(13, 0, 0, 0);
  const overlapEndUTC = new Date(overlapStartUTC);
  overlapEndUTC.setUTCHours(14);

  await db.insert(availabilities).values({
    eventId,
    userId,
    startTime: overlapStartUTC,
    endTime: overlapEndUTC,
    timezone,
  });

  // 🧍 Personal availability (LOCAL TIME varies per user)
  const personalStart = new Date(tomorrow);
  switch (label) {
    case "Tokyo":
      personalStart.setHours(19, 0, 0, 0); // 7–9pm JST
      break;
    case "California":
      personalStart.setHours(9, 0, 0, 0); // 9–11am PDT
      break;
    case "New York":
      personalStart.setHours(13, 0, 0, 0); // 1–3pm EDT
      break;
  }

  const personalAvail = Array.from({ length: 2 }).map((_, i) => {
    const start = new Date(personalStart);
    start.setHours(personalStart.getHours() + i);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return {
      eventId,
      userId,
      startTime: start,
      endTime: end,
      timezone,
    };
  });

  await db.insert(availabilities).values(personalAvail);

  // 🗓️ Default: 6–8pm Mon–Fri
  const defaultToInsert = Array.from({ length: 5 }).flatMap((_, i) => {
    const day = i + 1;
    return [18, 19].map((hour) => ({ userId, day, hour }));
  });

  await db.insert(defaultAvailabilities).values(defaultToInsert);
}

console.log("✅ Seed complete with staggered availabilities!");
