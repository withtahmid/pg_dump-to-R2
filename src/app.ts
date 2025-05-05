import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { router } from "./routes";
import { logger } from "./utils/logger";

export const createApp = (): express.Application => {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan("combined"));
    app.use(router);

    app.use(
        (
            err: Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            logger.error("Unhandled error:", err);

            res.status(500).json({
                success: false,
                message: "Internal server error",
                error:
                    process.env.NODE_ENV === "production"
                        ? undefined
                        : err.message,
            });
        }
    );

    return app;
};
