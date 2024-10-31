import mongoose from 'mongoose';
import { catchAsyncError } from '../midellware/catchAsyncError.js'
import ErrorHandler from '../midellware/error.js'
import { Auction } from '../models/auctionSchema.js';

export const checkAuctionEndTime = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid id format",400))
    }
    const auction = await Auction.findById(id);
    if(!auction){
        return next(new ErrorHandler("Auction not found",404))
    }
    const now = new Date();
    if(new Date(auction.startTime) > now){
        return next(new ErrorHandler("Auction has not start yet",400))
    }
    if(new Date(auction.endTime) < now){
        return next(new ErrorHandler("Auction is ended",400))
    }
    next()
})