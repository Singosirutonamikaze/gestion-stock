import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  // Database
  DB_USER: Joi.string().optional().default('postgres'),
  DB_PASSWORD: Joi.string().optional().default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().optional().default('gestion_stock'),
  DB_SCHEMA: Joi.string().default('public'),
  DATABASE_URL: Joi.string().optional(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // JWT & Security
  JWT_SECRET: Joi.string().default('default_jwt_secret_key_please_change_in_production'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().default('default_jwt_refresh_secret_key_please_change_in_production'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  CLIENT_URL: Joi.string().default('http://localhost:3001'),
});
