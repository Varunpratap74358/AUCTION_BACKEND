import { Auction } from '../models/auctionSchema.js'
import ErrorHandler from '../midellware/error.js'
import { User } from '../models/userSchema.js'
import { Bid } from '../models/bidSchema.js'
import { v2 as cloudinary } from 'cloudinary'
import { catchAsyncError } from '../midellware/catchAsyncError.js'
import mongoose from 'mongoose'

export const addNewAuctionItem = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler('Auction Item image required...', 400))
  }
  const { image } = req.files
  const allowedFormats = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedFormats.includes(image.mimetype)) {
    return next(new ErrorHandler('File format is not allowed', 401))
  }

  const {
    title,
    description,
    condition,
    startingBid,
    category,
    startTime,
    endTime,
  } = req.body

  if (
    !title ||
    !description ||
    !condition ||
    !startingBid ||
    !category ||
    !startTime ||
    !endTime
  ) {
    return next(new ErrorHandler('Please provide all detial', 401))
  }
  if (new Date(startTime) < Date.now()) {
    return next(
      new ErrorHandler(
        'Auction starting time must be greater then present time',
        400,
      ),
    )
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return next(
      new ErrorHandler(
        'Auction starting time must be lessa then ending time',
        400,
      ),
    )
  }
  const alreadyOneAuctionActive = await Auction.find({
    createdBy: req.user._id,
    endTime: { $gt: Date.now() },
  })
  if (alreadyOneAuctionActive.length > 0) {
    return next(new ErrorHandler('You already have one auction active'))
  }
  try {
    const clodinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
    )
    if (!clodinaryResponse || clodinaryResponse.error) {
      return next(
        new ErrorHandler(
          clodinaryResponse.error ||
            'Faild to upload auction image to cloudinary',
          400,
        ),
      )
    }
    const auctionItem = await Auction.create({
      title,
      description,
      condition,
      startingBid,
      category,
      startTime,
      endTime,
      image: {
        public_id: clodinaryResponse.public_id,
        url: clodinaryResponse.secure_url,
      },
      createdBy: req.user._id,
    })
    res.status(201).json({
      success: true,
      message: `Auction item created and will be kisted on auction at ${startTime}`,
      auctionItem,
    })
  } catch (error) {
    return next(
      new ErrorHandler(error.message || 'Faild to create auction', 500),
    )
  }
})

export const getAllAuctionItem = catchAsyncError(async (req, res, next) => {
  let items = await Auction.find()
  res.status(200).json({
    success: true,
    items,
  })
})

export const getMyAuctionItem = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id
  const items = await Auction.find({ createdBy: userId })
  res.status(200).json({
    success: true,
    items,
  })
})

export const getAuctionDetails = catchAsyncError(async (req, res, next) => {
  const auctionId = req.params.id
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return next(new ErrorHandler('Invalid id Format', 400))
  }
  const auctionItem = await Auction.findById(auctionId)
  if (!auctionItem) {
    return next(new ErrorHandler('Auction not found', 404))
  }
  const bidders = auctionItem.bids.sort((a, b) => b.amount - a.amount)
  // console.log(bidders)
  res.status(200).json({
    success: true,
    bidders,
    auctionItem,
  })
})

export const removeFromAuction = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id
  const auctionId = req.params.id
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return next(new ErrorHandler('Invalid id Format', 400))
  }
  const auctionItem = await Auction.findById(auctionId)
  if (!auctionItem) {
    return next(new ErrorHandler('Auction not found', 404))
  }

  await auctionItem.deleteOne()
  res.status(200).json({
    success: true,
    message: 'Auction item deleted successfully',
  })
})

export const republishItem = catchAsyncError(async (req, res, next) => {
  const auctionId = req.params.id
  if (!req.body.startTime || !req.body.endTime) {
    return next(new ErrorHandler('StartTime and End Time must be required'))
  }
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return next(new ErrorHandler('Invalid id Format', 400))
  }
  let auctionItem = await Auction.findById(auctionId)
  if (!auctionItem) {
    return next(new ErrorHandler('Auction not found', 404))
  }
  if (new Date(auctionItem.endTime) > Date.now()) {
    return next(
      new ErrorHandler('Auction is already active, cannot republish', 400),
    )
  }
  let data = {
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
  }

  if (data.startTime < Date.now()) {
    return next(
      new ErrorHandler(
        'Auction starting time must be grater than present time',
        400,
      ),
    )
  }
  if (data.startTime >= data.endTime) {
    return next(
      new ErrorHandler(
        'Auction starting time must be less than ending time',
        400,
      ),
    )
  }


  if(auctionItem.highestBidder){
    const highestBidder = await User.findById(auctionItem.highestBidder);
    highestBidder.monySpent -= auctionItem.currentBid;
    highestBidder.auctionWon -= 1;
    highestBidder.save()
  }



  data.bids = []
  data.commissionCalculated = false
  data.currentBid = 0;
  data.highestBidder = null;
  auctionItem = await Auction.findByIdAndUpdate(auctionId, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  await Bid.deleteMany({auctionItem : auctionItem._id})
  let createdBy = await User.findById(req.user._id)
  createdBy.unpaidCommission = 0
  await createdBy.save()
  res.status(200).json({
    success: true,
    message: `Auction republished and will be active on ${req.body.startTime}`,
    // createdBy
  })
})
