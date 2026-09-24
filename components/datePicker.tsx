"use client"

import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMemo, useState } from "react"
import { fr } from 'date-fns/locale';
import { CALENDAR_START_MONTH, CALENDAR_END_MONTH } from '@/constants/calendar';


interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value)
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };
  return (
    <Popover>
      <PopoverTrigger 
        render={
          <Button 
            variant={"outline"} 
            data-empty={!date} 
            className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            {date ? format(date, "PPP", {locale: fr}) : <span>Choisissez une date</span>}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        } 
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          defaultMonth={date}
          locale={fr}
          timeZone={timeZone}
          startMonth={CALENDAR_START_MONTH}
          endMonth={CALENDAR_END_MONTH}
        />
      </PopoverContent>
    </Popover>
  )
}
