import ReservationPeriods from '@/components/reservationPeriods'
import { getAllRecords } from '@/actions/crud'

export default async function PeriodsPage() {
    const disabledDate= await getAllRecords('blocked_day');
    const date = disabledDate.map(data => new Date(data.blocked_date))
  return (
    <div className="container mx-auto py-10">
    <ReservationPeriods disabledDate={date}/>
    </div>
  )
}
