"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  const { data: events, isLoading } = trpc.event.list.useQuery();

  const now = new Date();

  const scheduledEvents = (events ?? [])
    .filter((e) => e.scheduledStartTime && new Date(e.scheduledEndTime!).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.scheduledStartTime!).getTime() - new Date(b.scheduledStartTime!).getTime()
    );

  const unscheduledEvents = (events ?? []).filter((e) => !e.scheduledStartTime);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Upcoming Events</h1>
        <CreateEventDialog />
      </div>

      {isLoading ? (
        <p>Loading events...</p>
      ) : events?.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <>
          {scheduledEvents?.length > 0 && (
            <section>
              <h2 className="text-lg font-medium mb-2">📌 Scheduled</h2>
              <ul className="space-y-2">
                {scheduledEvents?.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="block p-4 border rounded hover:bg-muted transition"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.name}</p>
                        <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(event.scheduledStartTime!).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          @{" "}
                          {new Date(event.scheduledStartTime!).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground text-sm">{event.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {unscheduledEvents?.length > 0 && (
            <section>
              <h2 className="text-lg font-medium mt-6 mb-2">🕓 Waiting to be Scheduled</h2>
              <ul className="space-y-2">
                {unscheduledEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      className="block p-4 border rounded hover:bg-muted transition"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.name}</p>
                        <div className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-xs">
                          <ClockIcon className="w-4 h-4" />
                          Not scheduled
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground text-sm">{event.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
