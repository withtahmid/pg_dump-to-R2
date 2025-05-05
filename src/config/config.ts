import dotenv from "dotenv";
import { Config } from "../types";

dotenv.config();
const validateEnv = (): void => {
    const requiredEnvVars = [
        "PORT",
        "API_KEY",
        "DATABASE_URL",
        "R2_BUCKET",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_ACCOUNT_ID",
    ];

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        );
    }
};

const createConfig = (): Config => {
    validateEnv();
    const accountId = process.env.R2_ACCOUNT_ID as string;
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

    return {
        app: {
            port: parseInt(process.env.PORT || "3000", 10),
            apiKey: process.env.API_KEY as string,
        },
        db: {
            dbUrl: process.env.DATABASE_URL as string,
        },
        storage: {
            bucketName: process.env.R2_BUCKET as string,
            accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            accountId,
            endpoint,
        },
    };
};

export const config = createConfig();
