'use server'
import React from 'react'
import { Button } from '@/components/ui/button';
import CalendarComponent from '@/components/calendarDisabledDays';
import { deleteRecord, getAllRecords } from '@/actions/crud';
import { revalidatePath } from 'next/cache';
import ImportSchoolCalendar from "@/components/admin/importSchoolCalendar";
import Link from 'next/link';
async function unblockDate(formData: FormData) {
    'use server';

    const blockedDayId = formData.get('blockedDayId');

    if (typeof blockedDayId !== 'string' || !blockedDayId) {
        return;
    }

    await deleteRecord('blocked_day', blockedDayId);
    revalidatePath('/admin/disabledday');
}


const BlockedDays = async() => {
    const allBlockedDay =  await getAllRecords('blocked_day')
    return (
        <div className='flex-column items-center justify-center'>
            <CalendarComponent
                titre="Jours Bloqués"
                disabledDates={[ 
                ]}
                disabledList={allBlockedDay}
            />
            <ul>
            {allBlockedDay.map(({id, blocked_date, reason}) => (
                <li key={id}>
                    {blocked_date} raison {reason}{' '}
                    <form action={unblockDate}>
                        <Button type="submit" name="blockedDayId" value={String(id)}>
                            Débloquer la date
                        </Button>
                    </form>
                </li> 
            ))}
            </ul>
            <h2>Importer le calendrier scolaire</h2>
            <Link href="https://www.enseignement.be/calendrier-scolaire">lien vers le calendrier scolaire</Link>
            <p>Vous pouvez importer un fichier .ics pour ajouter des jours bloqués automatiquement.</p>
            <p>Le fichier .ics doit contenir les événements scolaires avec les dates de début et de fin.</p>
            <ImportSchoolCalendar />
        </div>
       
    )
}

export default BlockedDays


