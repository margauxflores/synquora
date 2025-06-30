import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  scheduledStartTime: timestamp("scheduled_start_time", { withTimezone: true }),
  scheduledEndTime: timestamp("scheduled_end_time", { withTimezone: true }),
  isLocked: boolean("is_locked").default(false),
  discordEventId: varchar("discord_event_id", { length: 255 }),
});

export const eventParticipants = pgTable("event_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
});

export const availabilities = pgTable("availabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  timezone: varchar("timezone", { length: 128 }).notNull(),
});

export const defaultAvailabilities = pgTable("default_availabilities", {
  userId: text("user_id").notNull(),
  day: integer("day").notNull(),
  hour: integer("hour").notNull(),
});
