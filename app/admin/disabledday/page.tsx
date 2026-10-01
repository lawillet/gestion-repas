'use server'

import CalendarComponent from '@/components/calendarDisabledDays';
import { getAllRecords } from '@/actions/crud';
import ImportSchoolCalendar from "@/components/admin/importSchoolCalendar";
import Link from 'next/link';
import { format } from 'date-fns'
import { columns } from "./columns"
import { DataTable } from "../../../components/data-table" 

const BlockedDays = async() => {
    const allBlockedDay =  await getAllRecords('blocked_day')
        const data = [...allBlockedDay]
            .sort((left, right) => new Date(left.blocked_date).getTime() - new Date(right.blocked_date).getTime())
            .map((data) => ({
        id: data.id,
        blocked_date: format(data.blocked_date, 'dd/MM/yyyy'),
        reason: data.reason
            }))
    const blockedDates = (await getAllRecords('blocked_day')).map(
    (row) => new Date(row.blocked_date)
    )
    return (
        <div>
            <div className="flex justify-center">
                <CalendarComponent
                    titre="Jours Bloqués"
                    disabledDates={ blockedDates}
                    disabledList={allBlockedDay}
                />
            </div>
            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={data} pageSize={10} />
            </div>
            <div className='container mx-auto py-10'>
                <h2 className='text-2xl'>Importer le calendrier scolaire</h2>
                
                <p>
                    Vous pouvez importer un fichier .ics pour ajouter des jours bloqués automatiquement. Voici un lien vers les calendriers de FWB.
                </p>
            
                <Link  className="font-sm text-primary text-center hover:underline" href="https://www.enseignement.be/calendrier-scolaire">
                    lien vers le calendrier scolaire
                </Link>
            </div>
            <div className='container mx-auto py-10'>
            <ImportSchoolCalendar />
            </div>
        </div>
       
    )
}

export default BlockedDays


