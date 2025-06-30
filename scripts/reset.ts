/**
 * 🧼 Reset Script for Synquora
 *
 * This script clears all existing data from key tables in the database.
 * Useful for resetting the local or testing environment to a clean state.
 *
 * ⚠️ WARNING: This will delete all data from events, participants, and availabilities.
 */

import "dotenv/config";
import { db } from "@/lib/drizzle/client";
import {
  availabilities,
  defaultAvailabilities,
  eventParticipants,
  events,
} from "@/lib/drizzle/schema";

console.log("🧼 Clearing existing data...");

// Remove all user-submitted availability time slots
await db.delete(availabilities);

// Remove all participant mappings from events
await db.delete(eventParticipants);

// Remove all event records
await db.delete(events);

// Remove user default availability preferences
await db.delete(defaultAvailabilities);

console.log("✅ Cleared.");
