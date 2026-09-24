"use client"

import {
  ChevronDownIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    getEndYear,
    getReservationPeriodsUntil,
    type ReservationPeriod
} from '@/constants/constants'
interface ReservationPeriodsListProps {
    disabledDate: Date[],
}
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function ButtonGroupDropdown({disabledDate} : ReservationPeriodsListProps) {
    const [reservationPeriods, setReservationPeriods] = useState<ReservationPeriod[]>([])
    //const jean = "?start=${period.start}&end=${period.end}"
    useEffect(() => {
        let isMounted = true
    
        async function loadPeriods() {
            const endYear = await getEndYear()
            const periods = await getReservationPeriodsUntil(endYear, disabledDate)
    
            if (isMounted) {
                setReservationPeriods(periods)
            }
        }
    
        loadPeriods()
    
        return () => {
            isMounted = false
        }
    }, [disabledDate])
  return (
    <ButtonGroup>
      <Button variant="outline">Exporter les réservations</Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={
            <Button variant="outline" className="pl-2!">
                <ChevronDownIcon />
            </Button>
        } />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            {reservationPeriods.map((period) => 
            (
                <DropdownMenuItem 
                    key={period.cycleIndex}
                    onClick={(event) => {
                        event.preventDefault();

                        const start = format(period.start, 'yyyy-MM-dd');
                        const end = format(period.end, 'yyyy-MM-dd');
                        const url = new URL('/api/admin/export-reservations', window.location.origin);
                        url.searchParams.set('start', start);
                        url.searchParams.set('end', end);

                        window.location.href = url.toString();
                    }} 
                >
                    Du {format(period.start, 'dd/MM/yyyy', { locale: fr })}
                    {' '}au {format(period.end, 'dd/MM/yyyy', { locale: fr })}
                </DropdownMenuItem>

            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
