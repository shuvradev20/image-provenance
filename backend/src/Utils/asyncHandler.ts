import { type Request, type Response, type NextFunction } from "express";

const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}

export {asyncHandler}