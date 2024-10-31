 import { catchAsyncError } from '../midellware/catchAsyncError.js'
import { PaymentProf } from '../models/commissionProofSchema.js'
import ErrorHandler from '../midellware/error.js'
import { User } from '../models/userSchema.js'
import {v2 as cloudinary} from 'cloudinary'
import { Auction } from '../models/auctionSchema.js'
import mongoose from 'mongoose'

export const proofCommission = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler('Payment Proof Screenshot required', 401))
  }
  const { proof } = req.files
  const { amount, comment } = req.body
  const user = await User.findById(req.user._id)

  if (!amount || !comment) {
    return next(new ErrorHandler('Amount and comment are required fildes', 401))
  }
  if (user.unpaidCommission === 0) {
    return res.status(200).json({
      success: true,
      message: "You dont't have any commission.",
    })
  }
  if (user.unpaidCommission < amount) {
    return next(new ErrorHandler(`The amount exceeds your unpayed commission blance. Please enter an amount up to ${user.unpaidCommission}`,403))
  }
  const allowedFormats = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedFormats.includes(proof.mimetype)) {
    return next(new ErrorHandler('ScreenSchot format is not allowed', 401))
  }
  const clodinaryResponse = await cloudinary.uploader.upload(
    proof.tempFilePath,
  )
  if(!clodinaryResponse || clodinaryResponse.error){
    return next(new ErrorHandler(clodinaryResponse.error || "Cloudinary error",400))
  }
  const commissionProof = await PaymentProf.create({
    userId:req.user._id,
    proof:{
        public_id: clodinaryResponse.public_id,
      url: clodinaryResponse.secure_url,
    },
    amount,
    comment
  })
  res.status(201).json({
    success:true,
    message:"Your proof has been submited sccessfully. We will review it and respond to you within 24 hours",
    commissionProof
  });
})


export const calculateCommission = async(auctionId)=>{
  const auction = await Auction.findById(auctionId)
  // if(!mongoose.Types.ObjectId.isValid(auctionId)){

  // }
  const commissionRate = 0.05;
  const commission = auction.currentBid * commissionRate;
  const user = await User.findById(auction.createdBy)
  return commission;
}