import { 
  startOfDay, 
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  startOfWeek,
  subDays,
} from "date-fns";
import { getAllRecords } from "@/actions/crud";

let configCache: Promise<{
  endYear: string | Date;
  firstCommand: string | Date;
  fristReservation: string | Date;
}> | null = null;

async function getConfigValues() {
  if (!configCache) {
    configCache = (async () => {
      const config = await getAllRecords('config');
      const currentConfig = config[0];

      if (!currentConfig) {
        throw new Error('Aucune configuration trouvée dans la table config.');
      }

      return {
        endYear: currentConfig.endYear,
        firstCommand: currentConfig.firstCommand,
        fristReservation: currentConfig.fristReservation,
      };
    })();
  }

  return configCache;
}

export async function getEndYear(): Promise<Date>{
  const config = await getConfigValues();
  return new Date(config.endYear);
}

export function getAnchorEndYear(): Date {
  return new Date(new Date().getFullYear() + 1, 5, 30)
}

// previous ANCHOR_DEADLINE
export async function getFristCommand(): Promise<Date>{
  const config = await getConfigValues();
  return new Date(config.firstCommand);
}

// previous ANCHOR_RANGE_START
export async function getFirstReservation(): Promise<Date>{
  const config = await getConfigValues();
  return new Date(config.fristReservation);
}

export function getAnchorRangeStart(): Date {
  return new Date(new Date().getFullYear(), 8, 1)
}

export function getAnchorCommandDeadline(): Date {
  return new Date(new Date().getFullYear(), 8, 1)
}
export const ADMIN = 'ADMIN';
export const USER = 'USER';
export const CYCLE_LENGTH_DAYS = 14;
export const ANCHOR_RANGE_START = getAnchorRangeStart();
export const ANCHOR_COMMAND_DEADLINE = getAnchorCommandDeadline();
export const ANCHOR_END_YEAR = getAnchorEndYear();
const currentYear = new Date().getFullYear();

// Default values for the first range, deadline and school year end
/*const DEFAULT_ANCHOR_RANGE_START = new Date(currentYear, 8, 1);
const DEFAULT_ANCHOR_RANGE_END = addDays(DEFAULT_ANCHOR_RANGE_START, CYCLE_LENGTH_DAYS);
const DEFAULT_ANCHOR_COMMAND_DEADLINE = subDays(DEFAULT_ANCHOR_RANGE_START, 5);
const DEFAULT_ANCHOR_END_YEAR = new Date(currentYear + 1, 5, 30);

// Storage keys
const STORAGE_KEY_ANCHOR_START = 'ANCHOR_RANGE_START';
const STORAGE_KEY_ANCHOR_END = 'ANCHOR_RANGE_END';
const STORAGE_KEY_ANCHOR_DEADLINE = 'ANCHOR_COMMAND_DEADLINE';
const STORAGE_KEY_ANCHOR_END_YEAR = 'ANCHOR_END_YEAR';

// Getter functions that retrieve from localStorage
export function getAnchorRangeStart(): Date {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_ANCHOR_START);
    if (stored) {
      return new Date(stored);
    }
  }
  return DEFAULT_ANCHOR_RANGE_START;
}

export function getAnchorRangeEnd(): Date {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_ANCHOR_END);
    if (stored) {
      return new Date(stored);
    }
  }
  return DEFAULT_ANCHOR_RANGE_END;
}

export function getAnchorCommandDeadline(): Date {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_ANCHOR_DEADLINE);
    if (stored) {
      return new Date(stored);
    }
  }
  return DEFAULT_ANCHOR_COMMAND_DEADLINE;
}

export function getAnchorEndYear(): Date {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY_ANCHOR_END_YEAR);
    if (stored) {
      return new Date(stored);
    }
  }
  return DEFAULT_ANCHOR_END_YEAR;
}

// Setter functions
export function setAnchorRangeStart(date: Date): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ANCHOR_START, date.toISOString());
  }
}

export function setAnchorRangeEnd(date: Date): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ANCHOR_END, date.toISOString());
  }
}

export function setAnchorCommandDeadline(date: Date): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ANCHOR_DEADLINE, date.toISOString());
  }
}

export function setAnchorEndYear(date: Date): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ANCHOR_END_YEAR, date.toISOString());
  }
}

// Set all schooling year dates at once
export function setSchoolingYearDates(
  rangeStart: Date,
  rangeEnd: Date,
  commandDeadline: Date,
  endYear: Date
): void {
  setAnchorRangeStart(rangeStart);
  setAnchorRangeEnd(rangeEnd);
  setAnchorCommandDeadline(commandDeadline);
  setAnchorEndYear(endYear);
}

// Backward compatibility - use getters
export const ANCHOR_RANGE_START = getAnchorRangeStart();
export const ANCHOR_RANGE_END = getAnchorRangeEnd();
export const ANCHOR_COMMAND_DEADLINE = getAnchorCommandDeadline();
export const ANCHOR_END_YEAR = getAnchorEndYear();
*/
const WEEKDAYS = [1, 2, 4, 5];

export type ReservationWeek = {
  start: Date;
  end: Date;
};

export type ReservationPeriod = {
  cycleIndex: number;
  weeks: ReservationWeek[];
  start: Date;
  end: Date;
  commandDeadline: Date;
};

export async function getCurrentCycleIndex(
  today: Date, 
  blockedDates: Date[] = []
): Promise<number> {
  const config = await getConfigValues();
  const periods = await getReservationPeriodsUntil(
    addDays(startOfDay(today), 365),
    blockedDates,
    config
  )
  const normalizedToday = startOfDay(today)
  const currentPeriod = periods.find(
    (period) => period.commandDeadline >= normalizedToday
  )

  return currentPeriod?.cycleIndex ?? periods.length;
}

export  async function getReservationPeriodsUntil(
  endDate: Date,
  blockedDates: Date[] = [],
  fallbackConfig?: Awaited<ReturnType<typeof getConfigValues>>
) : Promise<ReservationPeriod[]> {
  const blockedDayKeys = new Set(
    blockedDates.map((blockedDate) => startOfDay(blockedDate).getTime())
  )
  const periods: ReservationPeriod[] = []
  const validWeeks: ReservationWeek[] = []
  const config = fallbackConfig ?? await getConfigValues();
  const maxDate = startOfDay(new Date(config.endYear))
  const limitDate = startOfDay(endDate) < maxDate ? startOfDay(endDate) : maxDate
  let weekStart = startOfWeek(startOfDay(new Date(config.fristReservation)), { weekStartsOn: 1 })

  while (weekStart <= limitDate) {
    if (!isWeekFullyBlocked(weekStart, blockedDayKeys)) {
      validWeeks.push({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      })
    }
    // normal case
    if (validWeeks.length === 2) {
      const [firstWeek, secondWeek] = validWeeks
      periods.push({
        cycleIndex: periods.length,
        weeks: validWeeks.splice(0, 2),
        start: firstWeek.start,
        end: secondWeek.end,
        commandDeadline: addDays(firstWeek.start, differenceInCalendarDays(
          startOfDay(new Date(config.firstCommand)),
          startOfWeek(startOfDay(new Date(config.fristReservation)), { weekStartsOn: 1 })
        )),
      })
    }

    weekStart = addDays(weekStart, 7)
  }

  if (validWeeks.length === 1) {
    // If there's one week left, we can create a period with just that week
    const [lastWeek] = validWeeks
    periods.push({
      cycleIndex: periods.length,
      weeks: validWeeks.splice(0, 1),
      start: lastWeek.start,
      end: lastWeek.end,
      commandDeadline: addDays(lastWeek.start, differenceInCalendarDays(
        startOfDay(new Date(config.firstCommand)),
        startOfWeek(startOfDay(new Date(config.fristReservation)), { weekStartsOn: 1 })
      )),
    });
  }

  return periods
}

function isWeekFullyBlocked(
  weekStart: Date,
  blockedDayKeys: Set<number>
): boolean {
  for (const weekday of WEEKDAYS) {
    if (!blockedDayKeys.has(addDays(weekStart, weekday - 1).getTime())) {
      return false
    }
  }

  return true
}

