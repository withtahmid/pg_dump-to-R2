import { spawn } from "child_process";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "stream";
import { BackupResult, Config } from "../types";
import { logger } from "../utils/logger";

const generateBackupFilename = (): string => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "00";

    const timestamp =
        `${getPart("year")}-${getPart("month")}-${getPart("day")}` +
        `_${getPart("hour")}-${getPart("minute")}-${getPart("second")}`;

    return `backup_${timestamp}.sql`;
};

const createS3Client = (config: Config): S3Client => {
    return new S3Client({
        endpoint: config.storage.endpoint,
        region: "auto",
        credentials: {
            accessKeyId: config.storage.accessKeyId,
            secretAccessKey: config.storage.secretAccessKey,
        },
        forcePathStyle: true,
    });
};

export const performBackup = async (config: Config): Promise<void> => {
    const startTime = new Date();
    const filename = generateBackupFilename();

    logger.info(`Starting pg_dump for database: ${config.db.dbUrl}`);
    logger.info(
        `Uploading SQL backup to R2 bucket "${config.storage.bucketName}" as key "${filename}"`
    );

    const passThrough = new PassThrough();
    const s3Client = createS3Client(config);

    const uploadParams = {
        Bucket: config.storage.bucketName,
        Key: filename,
        ContentType: "application/sql",
        Body: passThrough,
    };

    const upload = new Upload({
        client: s3Client,
        params: uploadParams,
    });

    upload.on("httpUploadProgress", (progress) => {
        logger.info(`Upload progress: ${progress.loaded} bytes uploaded`);
    });

    const uploadPromise = upload.done();

    const pgDump = spawn(
        "pg_dump",
        ["--no-owner", "--no-privileges", config.db.dbUrl],
        {
            stdio: ["ignore", "pipe", "pipe"],
        }
    );

    pgDump.stderr.on("data", (data) => {
        logger.error(`pg_dump error: ${data}`);
    });

    pgDump.stdout.pipe(passThrough);

    pgDump.on("error", (err) => {
        logger.error("Failed to start pg_dump:", err);
        upload.abort();

        const result: BackupResult = {
            success: false,
            message: "Backup failed: pg_dump process error",
            error: err.toString(),
            startTime,
            endTime: new Date(),
        };

        logger.backupResult(result);
    });

    pgDump.on("exit", (code, signal) => {
        if (code !== 0) {
            logger.error(
                `pg_dump exited with code ${code} or signal ${signal}`
            );
            upload.abort();

            const result: BackupResult = {
                success: false,
                message: `Backup failed: pg_dump exited with code ${
                    code || signal
                }`,
                filename,
                startTime,
                endTime: new Date(),
            };

            logger.backupResult(result);
            return;
        }
        passThrough.end();
        logger.info("Database dump completed, waiting for upload to finish...");
    });

    passThrough.on("error", (err) => {
        logger.error("Stream error:", err);
        upload.abort();

        const result: BackupResult = {
            success: false,
            message: "Backup failed: stream error",
            error: err.toString(),
            filename,
            startTime,
            endTime: new Date(),
        };

        logger.backupResult(result);
    });

    uploadPromise
        .then(() => {
            const result: BackupResult = {
                success: true,
                message: "Backup completed successfully",
                filename,
                startTime,
                endTime: new Date(),
            };

            logger.backupResult(result);
        })
        .catch((err) => {
            const result: BackupResult = {
                success: false,
                message: "Backup failed: upload error",
                error: err.toString(),
                filename,
                startTime,
                endTime: new Date(),
            };

            logger.backupResult(result);
        });
};
