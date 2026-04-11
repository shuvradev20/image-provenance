const config = {
    //token
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "fallback_secret_key",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_key",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",

    // cloudinary
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
    api_key: process.env.CLOUDINARY_API_KEY as string, 
    api_secret: process.env.CLOUDINARY_API_SECRET as string, 

    // pinata
    pinataApiKey: process.env.PINATA_API_KEY || "",
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY || "",
    pinataJwt: process.env.PINATA_JWT || "",
    gatewayUrl: process.env.GATEWAY_URL || "",

    provenanceAddress: process.env.PROVENANCE_ADDRESS || "",
    rpcUrl: process.env.RPC_URL || "",
    wsUrl: process.env.WS_URL || ""
};

export default config;