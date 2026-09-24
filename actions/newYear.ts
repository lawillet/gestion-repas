import { createRecord } from "./crud";
import { getAllRecords } from "./crud";


export async function newYear( firstCommand: string, firstReservation:string, endYear:string) {
    await createRecord('config',{
        firstCommand: firstCommand,
        fristReservation: firstReservation,
        endYear:endYear
    })
}

export async function listOfPeriods(){
    const blockedDates = (await getAllRecords('blocked_day')).map(
        (row) => new Date(row.blocked_date)
    )

}
