import {z} from 'zod';

export const addChildSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Le prénom ne peut être vide' }),
  surname: z
    .string()
    .min(1, { message: 'Le nom ne peut être vide' }),
    schooling: z.enum(["primary", "preschool"], {error: "vous devez choisir une scolarité"}),
    
});
export type addChildSchema = z.infer<typeof addChildSchema>;


export const updateChildSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Le prénom ne peut être vide' }),
  surname: z
    .string()
    .min(1, { message: 'Le nom ne peut être vide' }),
    schooling: z.enum(["primary", "preschool"], {error: "vous devez choisir une scolarité"}),
    
});
export type updateChildSchema = z.infer<typeof updateChildSchema>;
