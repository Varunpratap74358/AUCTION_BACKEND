import { User } from '../models/userSchema.js'
import { catchAsyncError } from '../midellware/catchAsyncError.js'
import ErrorHandler from '../midellware/error.js'

export const trackCommissionStatus = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (user.unpaidCommission > 0) {
    return next(
      new ErrorHandler(
        'You have unpaid commission pay then before posting a new auction.',
        400,
      ),
    );
  }
  next()
})
