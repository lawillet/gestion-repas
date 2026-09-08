import { startOfDay } from "date-fns";

export const ADMIN = 'ADMIN';
export const USER = 'USER';
export const CYCLE_LENGTH_DAYS = 14;
// first range of the first cycle (the reference cycle) and deadline for the first cycle
export const ANCHOR_RANGE_START = startOfDay(new Date(2026, 8, 7));      // 07/09/2026
export const ANCHOR_RANGE_END = startOfDay(new Date(2026, 8, 18));       // 18/09/2026
export const ANCHOR_COMMAND_DEADLINE = startOfDay(new Date(2026, 8, 2)); // 02/09/2026