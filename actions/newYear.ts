import { createRecord, deleteRecord } from "./crud";
import { getAllRecords } from "./crud";


export async function newYear( firstCommand: string, firstReservation:string, endYear:string) {
    const existingConfigs = await getAllRecords('config');
    await Promise.all(
        existingConfigs.map((config) => deleteRecord('config', config.id))
    );

    await createRecord('config',{
        firstCommand: firstCommand,
        fristReservation: firstReservation,
        endYear:endYear
    })
}


