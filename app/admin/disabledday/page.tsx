'use server'
import React from 'react'
import { Button } from '@/components/ui/button';
import CalendarComponent from '@/components/calendarDisabledDays';
import { deleteRecord, getAllRecords } from '@/actions/crud';
import { revalidatePath } from 'next/cache';

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
        <div className='flex-column align-item'>
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
        </div>
       
    )
}

export default BlockedDays


