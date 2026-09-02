import { format } from "date-fns";

import type { SchoolEvent } from "./parse-ics";
import type { BlockedDayInsert } from "@/schema/blocked-day.schema";
// Transforms period of time into a list of blocked days, one for each day in the period.
export function expandSchoolEvents(events: SchoolEvent[]): BlockedDayInsert[] {
  const blockedDays: BlockedDayInsert[] = [];

  for (const event of events) {
    const current = new Date(event.start);

    // DTEND est exclusif dans le format ICS.
    while (current < event.end) {
      blockedDays.push({
        blocked_date: format(current, "yyyy-MM-dd"),
        reason: event.title,
      });

      current.setDate(current.getDate() + 1);
    }
  }

  return blockedDays;
}