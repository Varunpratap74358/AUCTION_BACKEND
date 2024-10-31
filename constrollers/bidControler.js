import { catchAsyncError } from '../midellware/catchAsyncError.js'
import ErrorHandler from '../midellware/error.js'
import { Auction } from '../models/auctionSchema.js'
import { Bid } from '../models/bidSchema.js'
import { User } from '../models/userSchema.js'

export const placedItem = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const { amount } = req.body;
  const auctionItem = await Auction.findById(id)
  if (!auctionItem) {
    return next(new ErrorHandler('Auction Item not found', 404))
  }
  if (!amount) {
    return next(new ErrorHandler('Please netr your bid amount', 404))
  }
  if (amount <= auctionItem.currentBid) {
    return next(
      new ErrorHandler('Bid amount must be greater than the current bid', 401),
    )
  }
  if (amount < auctionItem.startingBid) {
    return next(
      new ErrorHandler('Bid aount must be greater than the starting bid', 401),
    )
  }

  try {
    const existingBid = await Bid.findOne({
      'bidder.id': req.user.id,
      auctionItem: auctionItem._id,
    })
    const existringBidInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() == req.user._id.toString(),
    )
    if (existringBidInAuction && existingBid) {
      existringBidInAuction.amount = amount;
      existingBid.amount = amount;
    //   await existringBidInAuction.save();
      await existingBid.save();
      auctionItem.currentBid = amount;
    } else {
      const biderDetail = await User.findById(req.user._id)
      const bid = await Bid.create({
        amount,
        bidder: {
          id: biderDetail._id,
          userName: biderDetail.userName,
          profileImage: biderDetail.profileImage?.url,
        },
        auctionItem: auctionItem._id,
      })
      auctionItem.bids.push({
        userId: req.user._id,
        userName: biderDetail.userName,
        profileImage: biderDetail.profileImage?.url,
        amount,
      })
      auctionItem.currentBid = amount;
    }
    await auctionItem.save()
    res.status(201).json({
      success: true,
      message: 'Bid placed',
      currentBid: auctionItem.currentBid,
    })
  } catch (error) {
    return next(new ErrorHandler(error.message || 'Faild to placed bid', 500))
  }
})
