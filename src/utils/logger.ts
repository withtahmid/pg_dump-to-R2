import { BackupResult } from "../types";

export const logger = {
    info: (message: string): void => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    },

    error: (message: string, error?: Error | unknown): void => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (error) {
            if (error instanceof Error) {
                console.error(`[ERROR] ${error.message}`);
                if (error.stack) {
                    console.error(`[ERROR] ${error.stack}`);
                }
            } else {
                console.error(`[ERROR] ${JSON.stringify(error)}`);
            }
        }
    },

    backupResult: (result: BackupResult): void => {
        const logMethod = result.success ? logger.info : logger.error;
        const durationMs =
            result.endTime && result.startTime
                ? result.endTime.getTime() - result.startTime.getTime()
                : null;

        const durationText = durationMs
            ? ` (completed in ${durationMs / 1000}s)`
            : "";

        logMethod(
            `Backup ${result.success ? "success" : "failed"}: ${
                result.message
            }${durationText}`
        );

        if (result.filename) {
            logMethod(`Backup filename: ${result.filename}`);
        }

        if (result.error) {
            logger.error(`Backup error details: ${result.error}`);
        }
    },
};
