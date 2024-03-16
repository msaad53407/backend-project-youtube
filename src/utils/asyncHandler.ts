import { NextFunction, Response, Request } from "express";

//& Wrapper to handle async errors using async await and try catch.
export const asyncHandler = (fn: Function) => async (err: Error, req: Request, res: Response, next: NextFunction) => {
    try {
        await fn(err, req, res, next);
    } catch (error: any) {
        res.status(error?.code || 500).json({
            success: false, 
            message: error?.message || 'Internal Server Error',
        });
    }
}

//& Wrapper to handle async errors using Promises
/*export const asyncHandler = (handlerFn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handlerFn(req, res, next)).catch((error: any) => next(error));
    }
}*/
