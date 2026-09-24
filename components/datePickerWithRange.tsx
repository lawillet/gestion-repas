"use client"

import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMemo, useState } from "react"
import { fr } from 'date-fns/locale';
import { CALENDAR_END_MONTH, CALENDAR_START_MONTH } from "@/constants/calendar"

interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange?: (dateRange: DateRange | undefined) => void;
}

export function DatePickerWithRange({ value, onChange }: DatePickerWithRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>(
    value
  )

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const handleDateRangeChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  return (
    <Field className="mx-auto w-60">
      <FieldLabel htmlFor="date-picker-range">
        Période de réservation des parents
      </FieldLabel>
      <Popover>
        <PopoverTrigger 
          render={
            <Button 
              variant="outline" 
              id="date-picker-range" 
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd LLL, y")} -{" "}
                    {format(date.to, "dd LLL, y")}
                  </>
                ) : 
                (
                  format(date.from, "dd LLL, y")
                )
              ) : 
              (
                <span>Choissisez une date</span>
              )
              }
            </Button>
          } 
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            timeZone={timeZone}
            locale={fr}
            startMonth={CALENDAR_START_MONTH}
            endMonth={CALENDAR_END_MONTH}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
