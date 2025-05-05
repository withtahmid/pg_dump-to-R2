import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== config.app.apiKey) {
        res.status(401).json({
            success: false,
            message: "Unauthorized. Invalid or missing API key.",
        });
        return;
    }

    next();
};
