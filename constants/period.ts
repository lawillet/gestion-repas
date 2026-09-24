import { getAllRecords } from "@/actions/crud";
import { 
    getReservationPeriodsUntil,
    getCurrentCycleIndex,
    getEndYear
} from "./constants";
export async function getReservationPeriod(today = new Date()) {
  const datas = await getAllRecords('blocked_day');
  const dates = datas.map((data) => new Date(data.blocked_date));

  const periods = await getReservationPeriodsUntil( await getEndYear(),dates);
  const index = await getCurrentCycleIndex(today);
  const currentCycleStart = periods[index]?.start;
  return currentCycleStart;
   
}