import { asyncHandler } from "../middleware/asyncHandler.middleware";
import { Request, Response } from "express";
import { config } from "../config/appConfig";


export const googleLoginCallback = asyncHandler(
     async (req:Request,res:Response)=>{
        const currentWorkspace = req.user?.currentWorkspace;

        if( !currentWorkspace){
            return  res.redirect(
                `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
            );
        }
        
        return res.redirect(
            `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
        );
     }
)