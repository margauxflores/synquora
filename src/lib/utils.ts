import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Given a Date _in any timezone_, returns a key "YYYY-MM-DD-HH"
 * in the target IANA timezone.
 */
export const getAvailabilityKey = (date: Date, timezone: string): string => {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd-HH");
};

/**
 * Map raw availability records (with `startTime: string`) into a Set of keys.
 */
export const mapAvailabilitiesToKeys = (
  availabilities: { startTime: string }[],
  timezone: string
): Set<string> => {
  return new Set(
    availabilities.map((a) => {
      const d = new Date(a.startTime);
      return getAvailabilityKey(d, timezone);
    })
  );
};

/**
 * Given your “default weekly availability” entries ({ day:0–6, hour:0–23 }),
 * plus the Sunday `startOfWeek`, build that week’s Set of keys.
 */
export const mapDefaultAvailabilityToKeys = (
  defaults: { day: number; hour: number }[],
  startOfWeek: Date,
  timezone: string
): Set<string> => {
  const result = new Set<string>();
  for (const { day, hour } of defaults) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + day);
    d.setHours(hour, 0, 0, 0);
    result.add(getAvailabilityKey(d, timezone));
  }
  return result;
};
