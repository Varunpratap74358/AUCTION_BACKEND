import { User } from "../models/userSchema.js";
import jwt from 'jsonwebtoken'
import ErrorHandler from "./error.js";
import { catchAsyncError } from "./catchAsyncError.js";
import dotenv from 'dotenv'
dotenv.config()

export const isAuthenticated = catchAsyncError(async(req,resizeBy,next)=>{
    const token = req.cookies.token;
    if(!token){
        return next(new ErrorHandler("User not Authenticated",400))
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = await User.findById(decoded.id);
    next()
})

export const isAuthorized = (...roles) => {
    roles = Object.freeze([...roles]);
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `${req.user.role} not allowed to access this resouce.`,
            403
          )
        );
      }
      next();
    };
  };