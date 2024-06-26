"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
//& Wrapper to handle async errors using async await and try catch.
// export const asyncHandler = (fn: Function) => async (err: Error, req: Request, res: Response, next: NextFunction) => {
//     try {
//         await fn(err, req, res, next);
//     } catch (error: any) {
//         res.status(error?.code || 500).json({
//             success: false,
//             message: error?.message || 'Internal Server Error',
//         });
//     }
// }
//& Wrapper to handle async errors using Promises
const asyncHandler = (handlerFn) => {
    return (req, res, next) => {
        Promise.resolve(handlerFn(req, res, next)).catch((error) => next(error));
    };
};
exports.asyncHandler = asyncHandler;
