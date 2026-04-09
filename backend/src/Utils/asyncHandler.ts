import { type Request, type Response, type NextFunction } from "express";

// --- Asynchronous Request Wrapper ---

/**
 * @function asyncHandler
 * @description A higher-order function that wraps asynchronous Express route handlers.
 * It eliminates the need for repetitive try-catch blocks in controllers by 
 * catching any rejected promises and passing the error to the next middleware.
 * * @param requestHandler - The asynchronous controller function to be executed.
 * @returns A standard Express middleware function.
 */
const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Ensures the request handler is executed within a Promise, 
        // automatically catching any errors and forwarding them to the error-handling middleware.
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}

export {asyncHandler}