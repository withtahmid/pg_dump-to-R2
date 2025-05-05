import { IncomingMessage, Server, ServerResponse } from "http";
import { createApp } from "./app";
import { config } from "./config/config";
import { logger } from "./utils/logger";

const setupGracefulShutdown = (
    server: Server<typeof IncomingMessage, typeof ServerResponse>
): void => {
    process.on("SIGINT", () => {
        logger.info("SIGINT received, shutting down gracefully");
        server.close(() => {
            logger.info("Server closed");
            process.exit(0);
        });
    });

    process.on("SIGTERM", () => {
        logger.info("SIGTERM received, shutting down gracefully");
        server.close(() => {
            logger.info("Server closed");
            process.exit(0);
        });
    });
};

const bootstrap = async (): Promise<void> => {
    try {
        const app = createApp();
        const server = app.listen(config.app.port, () => {
            logger.info(`Server running on port ${config.app.port}`);
        });
        setupGracefulShutdown(server);
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
bootstrap().catch((err) => {
    logger.error("Unhandled error during bootstrap:", err);
    process.exit(1);
});
