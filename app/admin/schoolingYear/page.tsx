import { DatePicker } from '@/components/datePicker'
import {DatePickerWithRange} from '@/components/datePickerWithRange'

const schoolingYear = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <DatePicker />
      <DatePickerWithRange />
    </main>
  )
}

export default schoolingYear