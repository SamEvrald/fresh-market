// src/config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  RESEND_API_KEY: Joi.string().required(),
  RESEND_SENDER_EMAIL: Joi.string().email().optional(),

  // MTN Mobile Money configuration
  MTN_BASE_URL: Joi.string().uri().optional(),
  MTN_COLLECTION_CLIENT_ID: Joi.string().required(),
  MTN_COLLECTION_CLIENT_SECRET: Joi.string().required(),
  MTN_COLLECTION_API_KEY: Joi.string().required(), // Oauth client config ID
  MTN_CALLBACK_HOST: Joi.string().uri().required(), // Your public domain, e.g., 'https://api.yourdomain.com'
  MTN_TARGET_ENVIRONMENT: Joi.string().valid('sandbox', 'production').default('sandbox'),
});