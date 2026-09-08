import { addDays, format } from "date-fns";


// Define reservation period based on the first date of the reservation.
//  The period is 14 days long by default.
export function getReservationPeriod(firstDate: Date) {
  const start = new Date(firstDate);
  const end = addDays(start, 14);

  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}