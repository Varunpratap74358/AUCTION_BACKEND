import { catchAsyncError } from '../midellware/catchAsyncError.js'
import ErrorHandler from '../midellware/error.js'
import { Commission } from '../models/commisionSchema.js'
import { User } from '../models/userSchema.js'
import { Auction } from '../models/auctionSchema.js'
import { PaymentProf } from '../models/commissionProofSchema.js'
import mongoose from 'mongoose'

export const deleteAuctionItem = catchAsyncError(async (req, res, next) => {
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

export const getPaymentProofs = catchAsyncError(async (req, res, next) => {
  let paymentsProofs = await PaymentProf.find()
  res.status(200).json({
    success: true,
    paymentsProofs,
  })
})

export const getPaymentProofDetail = catchAsyncError(async (req, res, next) => {
  const id = req.params.id
  const paymentsProofDetail = await PaymentProf.findById(id)
  res.status(200).json({
    success: true,
    paymentsProofDetail,
  })
})

export const updateProofStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const { amount, status } = req.body
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler('Invalid ID format', 400))
  }
  let proof = await PaymentProf.findById(id)
  if (!proof) {
    return next(new ErrorHandler('Payment Proof is not found', 404))
  }
  proof = await PaymentProf.findByIdAndUpdate(
    id,
    { status, amount },
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    success: true,
    message: 'Payment proof amount updated',
    proof,
  })
})

export const deletePaymentProof = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler('Invalid ID format', 400))
  }
  let proof = await PaymentProf.findByIdAndDelete(id)
  if (!proof) {
    return next(new ErrorHandler('Data is not found'))
  }
  res.status(200).json({
    success: true,
    message: 'Payment proof deleted successfully.',
  })
})

export const fetchAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $month: '$createdAt' },
          role: '$role',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: '$_id.month',
        year: '$_id.year',
        role: '$_id.role',
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { year: 1, month: 1 },
    },
  ])
  const bidders = users.filter((user) => user.role === 'Bidder')
  const auctinors = users.filter((user) => user.role === 'Auctioner')
  const transFromdataToMonthlyArrray = (data, totalMonths = 12) => {
    const result = Array(totalMonths).fill(0)
    data.forEach((item) => {
      result[item.month - 1] = item.count
    })
    return result
  }
  const biddersArray = transFromdataToMonthlyArrray(bidders)
  const auctenersArray = transFromdataToMonthlyArrray(auctinors)
  res.status(200).json({
    success: true,
    biddersArray,
    auctenersArray,
  })
})

export const monthlyRevenue = catchAsyncError(async (req, res, next) => {
  const payments = await Commission.aggregate([
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ])

  const transFromdataToMonthlyArray = (payments, totalMonths = 12) => {
    const result = Array(totalMonths).fill(0)
    payments.forEach((payment) => {
      result[payment._id.month - 1] = payment.totalAmount
    })
    return result
  }

  const totalMonthlyRevenue = transFromdataToMonthlyArray(payments)
  res.status(200).json({
    success: true,
    totalMonthlyRevenue,
  })
})
