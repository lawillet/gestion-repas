import ICAL from "ical.js";

export type SchoolEvent = {
  title: string;
  start: Date;
  end: Date;
};
// parses an ICS file and returns an array of SchoolEvent objects
export function parseICS(content: string): SchoolEvent[] {
  const jcal = ICAL.parse(content);

  const component = new ICAL.Component(jcal);

  const events = component.getAllSubcomponents("vevent");

  return events.map((event) => {
    const e = new ICAL.Event(event);

    return {
      title: e.summary,
      start: e.startDate.toJSDate(),
      end: e.endDate.toJSDate(),
    };
  });
}