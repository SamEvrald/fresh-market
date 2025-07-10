// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    senderEmail: process.env.RESEND_SENDER_EMAIL || 'Fresh Market <onboarding@resend.dev>',
  },
  mtn: { // Add MTN config here
    baseUrl: process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com', // Sandbox URL
    collectionClientId: process.env.MTN_COLLECTION_CLIENT_ID,
    collectionClientSecret: process.env.MTN_COLLECTION_CLIENT_SECRET,
    collectionApiKey: process.env.MTN_COLLECTION_API_KEY, // Oauth client config ID
    callbackHost: process.env.MTN_CALLBACK_HOST, // Your publicly accessible domain for webhooks
    targetEnvironment: process.env.MTN_TARGET_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
    // Add more if needed, e.g., disbursement keys
  },
});