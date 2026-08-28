import {z} from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'adresse email invalide' }),
  password: z.string().min(1, { message: 'le mot de passe ne peut être vide' }),
});
export type loginSchema = z.infer<typeof loginSchema>;

export const loginSchemaServer = z.object({
  email: z.email({ message: 'adresse email invalide' }),
  password: z.string().min(6, { message: 'le mot de passe doit au moins contenir 6 caractéres' }),
});
export type loginSchemaServer = z.infer<typeof loginSchemaServer>;

export const inscriptionSchemaServer = z.object({
  email: z.email({ message: 'adresse email invalide' }),
  password: z.string().min(6, { message: 'le mot de passe doit au moins contenir 6 caractéres' }),
});
export type inscriptionSchemaServer = z.infer<typeof inscriptionSchemaServer>;

export const passwordResetSchema = z.object({
  email: z.email({ message: 'adresse email invalide' }),
});
export type passwordResetSchema = z.infer<typeof passwordResetSchema>;

export const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' }),
});
export type updatePasswordSchema = z.infer<typeof updatePasswordSchema>;

