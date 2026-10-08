const DEV_FALLBACK_SECRET = 'dev_only_insecure_secret_do_not_use_in_production';
const KNOWN_WEAK_SECRETS = ['super_secret_change_me', 'your_secret_key', DEV_FALLBACK_SECRET];

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jwtSecret = process.env.JWT_SECRET || '';

if (isProduction) {
  if (jwtSecret.length < 32 || KNOWN_WEAK_SECRETS.includes(jwtSecret)) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters when NODE_ENV=production.');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set when NODE_ENV=production.');
  }
}

const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: jwtSecret || DEV_FALLBACK_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // Comma-separated list of allowed browser origins.
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  nodeEnv,
  isProduction,
  databaseUrl: process.env.DATABASE_URL || '',
  dbPoolMax: Number(process.env.DB_POOL_MAX || 10),
  // Set to 1 when running behind Nginx / a PaaS proxy so rate limiting sees the real client IP.
  trustProxy: process.env.TRUST_PROXY || '',
};

module.exports = { env };
