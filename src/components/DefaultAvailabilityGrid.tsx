"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function DefaultAvailabilityGrid() {
  const { user } = useUser();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const utils = trpc.useUtils();
  const { data: existing = [] } = trpc.defaultAvailability.list.useQuery(undefined, {
    enabled: !!user?.id,
  });

  const { mutate: saveAvailability, isPending } = trpc.defaultAvailability.set.useMutation({
    onSuccess: () => {
      utils.defaultAvailability.list.invalidate();
      toast.success("Preferences saved!");
    },
    onError: (error) => {
      console.error("Failed to save availability:", error);
      toast.error("Something went wrong while saving preferences.");
    },
  });

  useEffect(() => {
    if (existing.length === 0) return;

    const newSet = new Set<string>();
    for (const { day, hour } of existing) {
      newSet.add(`${Number(day)}-${Number(hour)}`);
    }

    const isSame = selected.size === newSet.size && [...selected].every((k) => newSet.has(k));

    if (!isSame) setSelected(newSet);
  }, [existing]);

  const toggleCell = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    const copy = new Set(selected);
    if (copy.has(key)) {
      copy.delete(key);
    } else {
      copy.add(key);
    }
    setSelected(copy);
  };

  const handleSubmit = () => {
    if (!user) return;

    const data = Array.from(selected).map((key) => {
      const [day, hour] = key.split("-").map(Number);
      return { day, hour };
    });

    saveAvailability(data);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Default Weekly Availability</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-muted text-center text-sm w-20">Hour ↓ / Day →</th>
              {days.map((day, idx) => (
                <th key={idx} className="border px-2 py-1 bg-muted text-center text-sm w-24">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="border px-2 py-1 text-sm bg-muted text-center w-16">
                  {hour.toString().padStart(2, "0")}:00
                </td>
                {days.map((_, dayIdx) => {
                  const key = `${dayIdx}-${hour}`;
                  const isSelected = selected.has(key);
                  return (
                    <td
                      key={key}
                      onClick={() => toggleCell(dayIdx, hour)}
                      className={cn(
                        "border w-10 h-10 text-center text-xs cursor-pointer transition",
                        isSelected ? "bg-primary text-white" : "hover:bg-muted"
                      )}
                    >
                      {isSelected ? "✓" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}
