import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

const registerHandler = asyncHandler((req: Request, res: Response) => {
  res.status(200).json({
    message: `OK`,
  });
});

const loginHandler = asyncHandler((req: Request, res: Response) => {
  res.status(200).json({
    message: "OK",
  });
});

export { registerHandler, loginHandler };