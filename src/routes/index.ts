import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { performBackup } from "../services/backup";
import { config } from "../config/config";
import { logger } from "../utils/logger";

const router = Router();

router.post(
    "/api/backup",
    authMiddleware,
    async (req: Request, res: Response) => {
        try {
            const startTime = new Date();
            res.status(202).json({
                success: true,
                message: "Backup process started",
                startTime,
            });

            performBackup(config).catch((err) => {
                logger.error("Unhandled error in backup process:", err);
            });
        } catch (error) {
            const err = error as Error;
            logger.error("Error starting backup process:", err);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to start backup process",
                    error: err.message,
                });
            }
        }
    }
);

router.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date(),
    });
});

export { router };
