import { catchAsyncError } from '../midellware/catchAsyncError.js'
import ErrorHandler from '../midellware/error.js'
import { User } from '../models/userSchema.js'
import cloudinary from 'cloudinary'
import { genrateToken } from '../utils/jwtToken.js'

export const register = catchAsyncError(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler('Profile image required...', 400))
  }
  const { profileImage } = req.files
  const allowedFormats = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedFormats.includes(profileImage.mimetype)) {
    return next(new ErrorHandler('File format is not allowed', 401))
  }

  const {
    userName,
    password,
    email,
    address,
    role,
    phone,
    backAccountNumber,
    backAccountIFSC,
    bankName,
    PhonePayNumber,
    paypalEmail,
  } = req.body

  if (!userName || !password || !email || !address || !role || !phone) {
    return next(new ErrorHandler('Please fill full form', 401))
  }
  if (role === 'Auctioner') {
    if (!backAccountIFSC || !backAccountNumber || !bankName) {
      return next(
        new ErrorHandler('Please provide your fill bank details', 400),
      )
    }
    if (!PhonePayNumber) {
      return next(new ErrorHandler('Please provide your PhonePayNumber', 400))
    }
    if (!paypalEmail) {
      return next(new ErrorHandler('Please provide your paypal email', 400))
    }
  }
  const isRegister = await User.findOne({ email })
  if (isRegister) {
    return next(new ErrorHandler('User already exist with this email', 400))
  }
  const clodinaryResponse = await cloudinary.uploader.upload(
    profileImage.tempFilePath,
  )
  if (!clodinaryResponse || clodinaryResponse.error) {
    return next(
      new ErrorHandler(clodinaryResponse.error || 'Cloudinary error', 400),
    )
  }
  const user = await User.create({
    userName,
    password,
    email,
    address,
    role,
    phone,
    profileImage: {
      public_id: clodinaryResponse.public_id,
      url: clodinaryResponse.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        backAccountNumber,
        backAccountIFSC,
        bankName,
      },
      phonePay: {
        PhonePayNumber,
      },
      paypal: {
        paypalEmail,
      },
    },
  })
  genrateToken(user, 'User registered', 201, res)
})

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    return next(new ErrorHandler('Provide all detail', 400))
  }
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new ErrorHandler('user not found', 404))
  }
  const comparePassword = await user.comparePassword(password)
  if (!comparePassword) {
    return next(new ErrorHandler('Password is wrong', 401))
  }
  genrateToken(user, 'User login successfully', 200, res)
})

export const logout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', '', { maxAge: 0 }).status(200).json({
    message: 'User logout successfully',
    success: true,
  })
})

export const getUserProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id
  const user = await User.findById(userId)
  res.status(200).json({
    success: true,
    user,
  })
})

export const fetchLeaderboard = catchAsyncError(async (req, res, next) => {
  const users = await User.find({ monySpent: { $gt: 0 } })
  const leaderboard = users.sort((a, b) => b.monySpent - a.monySpent)
  res.status(200).json({
    success: true,
    leaderboard,
  })
})
