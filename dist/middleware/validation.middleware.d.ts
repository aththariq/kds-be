import { Request, Response, NextFunction } from "express";
/**
 * Validation middleware for simulation parameters
 */
export declare const validateSimulationParams: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation middleware for MongoDB ObjectId
 */
export declare const validateObjectId: (req: Request, res: Response, next: NextFunction) => void;
/**
 * General error handling middleware
 */
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware for handling 404 routes
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
