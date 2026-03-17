import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'El usuario es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
  captchaAnswer: z
    .string()
    .min(1, 'Resuelve la suma para continuar'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;