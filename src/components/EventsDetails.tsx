"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import {
  getAvailabilityKey,
  mapAvailabilitiesToKeys,
  mapDefaultAvailabilityToKeys,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type Props = { eventId: string };

export function EventsDetails({ eventId }: Props) {
  const { user } = useUser();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [hostName, setHostName] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/discord/channels")
      .then((res) => res.json())
      .then(setChannels)
      .catch(() => setChannels([]));
  }, []);

  const utils = trpc.useUtils();

  const { data: event, isLoading: loadingEvent } = trpc.event.getById.useQuery({ id: eventId });
  const { data: mine = [] } = trpc.availability.listByEventAndUser.useQuery(
    { eventId, userId: user?.id ?? "" },
    { enabled: !!user?.id }
  );
  const { data: defaults = [] } = trpc.defaultAvailability.list.useQuery(undefined, {
    enabled: !!user?.id,
  });
  const { data: all = [] } = trpc.availability.listByEvent.useQuery(
    { eventId },
    { enabled: !!eventId }
  );

  const [userMap, setUserMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const uniqueUserIds = Array.from(new Set(all.map((a) => a.userId)));

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: uniqueUserIds }),
    })
      .then((res) => res.json())
      .then((data: Record<string, { fullName: string | null; username: string | null }>) => {
        const map = new Map<string, string>();
        for (const [id, { fullName, username }] of Object.entries(data)) {
          map.set(id, fullName || username || id);
        }
        setUserMap(map);
      })
      .catch(() => {
        // fallback: show raw IDs
        const fallbackMap = new Map<string, string>();
        for (const id of uniqueUserIds) {
          fallbackMap.set(id, id);
        }
        setUserMap(fallbackMap);
      });
  }, [all]);

  const startOfWeek = useMemo(() => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay() + weekOffset * 7);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  }, [weekOffset]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [startOfWeek]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);

  const grouped = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const a of all) {
      const key = getAvailabilityKey(new Date(a.startTime), timezone);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a.userId);
    }
    return m;
  }, [all, timezone]);

  const defaultKeys = useMemo(
    () => mapDefaultAvailabilityToKeys(defaults, startOfWeek, timezone),
    [defaults, startOfWeek, timezone]
  );

  useEffect(() => {
    if (mine.length > 0) {
      const keysToUse = mapAvailabilitiesToKeys(mine, timezone);

      // Only update if contents have changed
      const prevArray = Array.from(selected);
      const nextArray = Array.from(keysToUse);
      const isEqual =
        prevArray.length === nextArray.length && prevArray.every((key) => nextArray.includes(key));

      if (!isEqual) {
        setSelected(keysToUse);
      }
    }
  }, [mine, timezone]);

  // — mutations
  const { mutate: saveAvailability, isPending: saving } =
    trpc.availability.saveAvailability.useMutation({
      onSuccess: async () => {
        await utils.availability.listByEventAndUser.invalidate({ eventId, userId: user!.id });
        await utils.availability.listByEvent.invalidate({ eventId });
        toast.success("Availability saved!");
      },
      onError: () => {
        toast.error("Something went wrong while saving.");
      },
    });

  const toggleCell = (date: Date, hour: number) => {
    const now = new Date();
    const cell = new Date(date);
    cell.setHours(hour, 0, 0, 0);
    if (cell < now) return;

    const key = getAvailabilityKey(cell, timezone);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!user) return;

    const prev = mapAvailabilitiesToKeys(mine, timezone);
    const added = [...selected].filter((k) => !prev.has(k));
    const removed = [...prev].filter((k) => !selected.has(k));

    if (added.length === 0 && removed.length === 0) {
      toast.info("No changes to save.");
      return;
    }

    const slots = [...selected].map((key) => {
      const [year, month, day, hour] = key.split("-");
      const start = new Date(`${year}-${month}-${day}T${hour.padStart(2, "0")}:00:00`);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      return {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
    });

    saveAvailability({
      eventId,
      timezone,
      slots,
    });
  };

  useEffect(() => {
    if (!event?.createdBy) return;
    fetch(`/api/user?userId=${event.createdBy}`)
      .then((r) => r.json())
      .then((d) => setHostName(d.fullName || d.username || "Unknown"))
      .catch(() => setHostName("Unknown"));
  }, [event?.createdBy]);

  const bestSlot = useMemo(() => {
    const slots = Array.from(grouped.entries())
      .map(([key, users]) => {
        const [y, m, d, h] = key.split("-");
        const date = new Date(`${y}-${m}-${d}T${h.padStart(2, "0")}:00:00`);
        return { date, count: users.length };
      })
      .filter(({ date }) => {
        const start = startOfWeek.getTime();
        return date.getTime() >= start && date.getTime() < start + 7 * 86_400_000;
      })
      .sort((a, b) => b.count - a.count || a.date.getTime() - b.date.getTime());
    return slots[0] || null;
  }, [grouped, startOfWeek]);

  const isCreator = user?.id === event?.createdBy;
  const isScheduled = !!event?.scheduledStartTime;
  const isLocked = event?.isLocked || false;

  const { mutate: scheduleEvent, isPending: isScheduling } = trpc.event.scheduleEvent.useMutation({
    onSuccess: async () => {
      await utils.event.getById.invalidate({ id: eventId });
      toast.success("Event successfully scheduled and pushed to Discord!");
    },
    onError: () => {
      toast.error("Something went wrong while scheduling.");
    },
  });

  const { mutate: unscheduleEvent, isPending: isUnscheduling } =
    trpc.event.unscheduleEvent.useMutation({
      onSuccess: async () => {
        await utils.event.getById.invalidate({ id: eventId });
        toast.success("Event unscheduled and removed from Discord!");
      },
      onError: () => {
        toast.error("Something went wrong while unscheduling.");
      },
    });

  if (loadingEvent) return <p>Loading…</p>;
  if (!event) return notFound();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ——— COMPACT HEADER + TOP SUGGESTION ——— */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            {hostName && <p className="text-sm text-muted-foreground">Hosted by {hostName}</p>}
          </div>

          {/* ——— SCHEDULER OR SUGGESTED SLOT ——— */}
          {event.scheduledStartTime ? (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
              <CalendarIcon className="w-4 h-4 text-green-500" />
              <span>
                Scheduled:{" "}
                {new Date(event.scheduledStartTime).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                @{" "}
                {new Date(event.scheduledStartTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : bestSlot ? (
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <span>
                Suggested:{" "}
                {bestSlot.date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                @{" "}
                {bestSlot.date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="bg-indigo-200 text-indigo-900 px-1 rounded-full">
                {bestSlot.count}
              </span>
            </div>
          ) : null}
        </div>

        {/* ——— SCHEDULE EVENT ——— */}
        {isCreator && (
          <div className="space-y-2 w-full max-w-sm">
            {!isScheduled && bestSlot && (
              <>
                <Select
                  value={selectedChannelId ?? "external"}
                  onValueChange={(value) =>
                    setSelectedChannelId(value === "external" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External (no channel)</SelectItem>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name} ({channel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() =>
                    scheduleEvent({
                      eventId,
                      startTime: bestSlot.date.toISOString(),
                      endTime: new Date(bestSlot.date.getTime() + 60 * 60 * 1000).toISOString(),
                      discordChannelId: selectedChannelId ?? undefined,
                    })
                  }
                  disabled={isScheduling}
                >
                  {isScheduling ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling…
                    </span>
                  ) : (
                    "Schedule this Event"
                  )}
                </Button>
              </>
            )}

            {isScheduled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Unschedule Event</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unschedule this event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will also delete the associated Discord event and unlock the calendar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => unscheduleEvent({ eventId })}
                      disabled={isUnscheduling}
                    >
                      {isUnscheduling ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Unscheduling…
                        </span>
                      ) : (
                        "Confirm"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* ——— WEEK NAV ——— */}
        <div className="grid grid-cols-3 items-center justify-between">
          <div className="flex justify-start">
            <AnimatePresence initial={false}>
              {weekOffset > 0 ? (
                <motion.div
                  key="prev"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button variant="outline" onClick={() => setWeekOffset((w) => w - 1)}>
                    ← Previous Week
                  </Button>
                </motion.div>
              ) : (
                <div className="w-[140px]" />
              )}
            </AnimatePresence>
          </div>
          <div className="text-center text-sm font-medium">
            Week of{" "}
            {startOfWeek.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex justify-end">
            <motion.div
              key="next"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="outline" onClick={() => setWeekOffset((w) => w + 1)}>
                Next Week →
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ——— LEGEND ——— */}
        <div className="flex gap-4 text-sm text-muted-foreground items-center flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 bg-indigo-100 border" /> 1 user
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 bg-indigo-300 border" /> 2 users
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 bg-indigo-500 border" /> 3+ users
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 bg-primary text-white border flex items-center justify-center">
              ✓
            </span>{" "}
            You
          </span>
          <span className="inline-flex items-center gap-1 ml-auto">
            <span className="w-4 h-4 bg-white relative">
              <span className="absolute bottom-0 right-0 text-xs animate-pulse">🕒</span>
            </span>{" "}
            Your Default Availability
          </span>
        </div>

        {/* ——— CALENDAR ——— */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-muted text-center text-sm">Hour \ Day</th>
                {days.map((d) => (
                  <th
                    key={d.toISOString()}
                    className="border px-2 py-1 bg-muted text-center text-sm w-24"
                  >
                    {d.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="border px-2 py-1 text-sm bg-muted text-center w-16">{hour}:00</td>
                  {days.map((date) => {
                    const cell = new Date(date);
                    cell.setHours(hour, 0, 0, 0);
                    const key = getAvailabilityKey(cell, timezone);
                    const usersHere = grouped.get(key) || [];
                    const count = usersHere.length;
                    const me = selected.has(key);
                    const isPast = cell < new Date();

                    if (isPast) {
                      return <td key={key} className="border w-10 h-10 bg-muted" />;
                    }

                    let bg = "hover:bg-muted";
                    if (me) bg = "bg-primary text-white";
                    else if (count >= 3) bg = "bg-indigo-500";
                    else if (count === 2) bg = "bg-indigo-300";
                    else if (count === 1) bg = "bg-indigo-100";

                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <motion.td
                            layout
                            transition={{ duration: 0.15 }}
                            onClick={() => toggleCell(date, hour)}
                            className={`border w-10 h-10 text-center text-xs cursor-pointer transition relative ${bg}`}
                          >
                            {me ? "✓" : count > 0 ? count : ""}
                            {!me && defaultKeys.has(key) && (
                              <span className="absolute bottom-0 right-0 text-xs animate-pulse pointer-events-none">
                                🕒
                              </span>
                            )}
                          </motion.td>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {usersHere.length > 0
                              ? `Available: ${usersHere.map((id) => userMap.get(id) ?? id).join(", ")}`
                              : "No one available"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ——— SUBMIT ——— */}
        {!isLocked && (
          <div className="text-right">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Save Availability"
              )}
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
