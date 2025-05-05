export interface BackupResult {
    success: boolean;
    message: string;
    filename?: string;
    error?: string;
    startTime?: Date;
    endTime?: Date;
}

export interface AppConfig {
    port: number;
    apiKey: string;
}

export interface DatabaseConfig {
    dbUrl: string;
}

export interface StorageConfig {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    accountId: string;
    endpoint: string;
}

export interface Config {
    app: AppConfig;
    db: DatabaseConfig;
    storage: StorageConfig;
}
