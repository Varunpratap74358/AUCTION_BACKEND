export const genrateToken = (user, message, statusCode, res) => {
    const token = user.genrateJsonWebToken()
    res
      .status(statusCode)
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 *60* 1000),
        httpOnly:true,
          secure:true,
          sameSite:"None"
      })
      .json({
        success: true,
        message,
        user,
        token,
      })
  }
  
