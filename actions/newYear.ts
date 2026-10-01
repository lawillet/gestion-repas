import { createRecord, deleteRecord, getAllRecords, updateRecord } from "./crud";


export async function newYear( firstCommand: string, firstReservation:string, endYear:string) {
    const existingConfigs = await getAllRecords('config');
    const configValues = {
        firstCommand,
        fristReservation: firstReservation,
        endYear,
    };

    if (existingConfigs.length === 0) {
        const createdConfig = await createRecord('config', configValues);
        if (!createdConfig) {
            throw new Error('La nouvelle configuration n’a pas été créée.');
        }
        return;
    }

    const [currentConfig, ...duplicateConfigs] = existingConfigs;
    const updatedConfig = await updateRecord('config', currentConfig.id, configValues);
    if (!updatedConfig) {
        throw new Error('La configuration existante n’a pas pu être mise à jour.');
    }

    await Promise.all(
        duplicateConfigs.map((config) => deleteRecord('config', config.id))
    );
}


