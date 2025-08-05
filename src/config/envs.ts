import 'dotenv/config';
import * as Joi from 'joi';

export interface envConfig {
  PORT: number;
  DATABASE_URL: string;
  // otros campos aquí...
}

// 2. Schema Joi
const envSchema = Joi.object({
  PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().required(),
  // otros...
}).unknown(true);

// 3. Validación
const validated = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (validated.error) {
  throw new Error(
    `❌ Error(s) en variables de entorno:\n${validated.error.details
      .map((d) => `- ${d.message}`)
      .join('\n')}`,
  );
}

const value = validated.value as Record<string, unknown>;

export const envs: envConfig = {
  PORT: Number(value.PORT),
  DATABASE_URL: String(value.DATABASE_URL),
  // otros campos, asegurando el tipo
};
