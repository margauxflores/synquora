"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";

export default function PastEventsPage() {
  const { data: events, isLoading } = trpc.event.list.useQuery();

  const now = new Date();

  const pastEvents = (events ?? [])
    .filter((e) => e.scheduledEndTime && new Date(e.scheduledEndTime).getTime() < now.getTime())
    .sort(
      (a, b) =>
        new Date(b.scheduledStartTime!).getTime() - new Date(a.scheduledStartTime!).getTime()
    );

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Past Events</h1>

      {isLoading ? (
        <p>Loading events...</p>
      ) : pastEvents.length === 0 ? (
        <p>No past events.</p>
      ) : (
        <ul className="space-y-2">
          {pastEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="block p-4 border rounded hover:bg-muted transition"
              >
                <p className="font-medium">{event.name}</p>
                <p className="text-muted-foreground text-sm">{event.description}</p>
                <p className="text-muted-foreground text-xs">
                  Scheduled for{" "}
                  {new Date(event.scheduledStartTime!).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
