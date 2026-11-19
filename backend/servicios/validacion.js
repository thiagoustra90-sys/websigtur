import { z } from "zod";

export const correoSchema = z.string().trim().toLowerCase().email().max(254);

export const esquemaRegistro = z
  .object({
    nombre: z.string().trim().min(1).max(100),
    apellido: z.string().trim().max(100).optional().default(""),
    correo: correoSchema,
    contrasena: z.string().min(8).max(128).optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .strict()
  .refine((datos) => datos.contrasena || datos.password, "La contraseña es obligatoria.");

export const esquemaInicioSesion = z
  .object({
    correo: correoSchema,
    contrasena: z.string().min(1).max(128).optional(),
    password: z.string().min(1).max(128).optional(),
  })
  .strict()
  .refine((datos) => datos.contrasena || datos.password, "La contraseña es obligatoria.");

export const actualizacionSesionSchema = z
  .object({
    tokenActualizacion: z.string().trim().min(20).max(4096).optional(),
    refreshToken: z.string().trim().min(20).max(4096).optional(),
    refresh_token: z.string().trim().min(20).max(4096).optional(),
  })
  .strict()
  .refine(
    (datos) => datos.tokenActualizacion || datos.refreshToken || datos.refresh_token,
    "Falta el token de actualización de la sesión.",
  );

// Alias temporal para integraciones que todavía importan el nombre anterior.
export { actualizacionSesionSchema as refreshSchema };

export const recuperarSchema = z
  .object({
    correo: correoSchema,
  })
  .strict();

export const profileSchema = z
  .object({
    nombre: z.string().trim().min(1).max(100).optional(),
    biografia: z.string().trim().max(300).nullable().optional(),
    ubicacion: z.string().trim().max(100).nullable().optional(),
    sitio_web: z.string().trim().max(500).nullable().optional(),
    avatar_url: z.string().trim().max(1500000).nullable().optional(),
  })
  .strict();

export const esquemaActualizacionContrasena = z
  .object({
    contrasena: z.string().min(8).max(128).optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .strict()
  .refine((datos) => datos.contrasena || datos.password, "La contraseña es obligatoria.");

// Alias temporales para clientes y módulos con los nombres históricos.
export {
  esquemaRegistro as registerSchema,
  esquemaInicioSesion as loginSchema,
  esquemaActualizacionContrasena as passwordUpdateSchema,
};

export const comentarioSchema = z
  .object({
    entidad_tipo: z.enum(["company", "event", "place"]),
    entidad_id: z.string().trim().min(1).max(255),
    contenido: z.string().trim().max(2000).optional().default(""),
    media_paths: z.array(z.string().max(500)).max(3).optional().default([]),
  })
  .strict();

export const entidadSchema = z
  .object({
    entidad_tipo: z.enum(["company", "event", "place"]),
    entidad_id: z.string().trim().min(1).max(255),
  })
  .strict();

export const likeSchema = entidadSchema.extend({
  activo: z.boolean(),
});

export const mensajeSchema = z
  .object({
    destinatario_id: z.string().uuid(),
    contenido: z.string().trim().max(5000).optional().default(""),
    tipo: z.enum(["texto", "archivo", "audio"]).optional(),
    audio_path: z.string().max(500).optional(),
    duration_seconds: z.number().int().min(1).max(120).optional(),
    attachments: z
      .array(
        z.object({
          path: z.string().max(500),
          name: z.string().max(180),
          mime: z.string().max(100),
          size: z.number().int().min(1).max(10485760),
        }),
      )
      .max(3)
      .optional()
      .default([]),
  })
  .strict();

export const eventSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable().optional().default(null),
    date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    date_end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional()
      .or(z.literal(""))
      .transform((value) => value || null),
    event_time: z.string().trim().max(20).nullable().optional().default(null),
    location: z.string().trim().min(1).max(300),
    latitude: z
      .union([
        z.number(),
        z
          .string()
          .regex(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/)
          .transform(Number),
      ])
      .pipe(z.number().finite().min(-90).max(90)),
    longitude: z
      .union([
        z.number(),
        z
          .string()
          .regex(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/)
          .transform(Number),
      ])
      .pipe(z.number().finite().min(-180).max(180)),
    price: z
      .union([
        z.number(),
        z
          .string()
          .regex(/^\d+(?:\.\d*)?$|^\.\d+$/)
          .transform(Number),
      ])
      .pipe(z.number().finite().min(0).max(1000000))
      .optional()
      .default(0),
    color: z
      .string()
      .regex(/^#[0-9a-f]{6}$/i)
      .optional()
      .default("#16b3a3"),
    image_url: z.string().trim().max(1500).nullable().optional().default(null),
    link: z.string().trim().max(1500).nullable().optional().default(null),
    categories: z.array(z.string().trim().min(1).max(100)).max(20).optional().default([]),
  })
  .strict();

export const baneoSchema = z
  .object({
    duration: z.enum(["none", "1h", "24h", "7d", "30d"]),
  })
  .strict();

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body ?? {});
      next();
    } catch (error) {
      next(error);
    }
  };
}
