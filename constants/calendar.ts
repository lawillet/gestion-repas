// Define the current scolary year 
const currentDate = new Date();
const calendarStartYear =
    currentDate.getMonth() >= 7
    ? currentDate.getFullYear()
    : currentDate.getFullYear() - 1;
export const CALENDAR_START_MONTH = new Date(calendarStartYear, 7);
export const CALENDAR_END_MONTH = new Date(calendarStartYear + 1, 7);