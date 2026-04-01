const config = {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "fallback_secret_key",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_key",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",

    pinataApiKey: process.env.PINATA_API_KEY || "",
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY || "",
    pinataJwt: process.env.PINATA_JWT || "",
    gatewayUrl: process.env.GATEWAY_URL || ""
};

export default config;