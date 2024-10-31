import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fileupload from 'express-fileupload'
import { errorMiddleware } from './midellware/error.js'
import userRoute from './routes/userRoute.js'
import auctionRoute from './routes/auctionRoute.js'
import bidRoute from './routes/bidRoute.js'
import commissionRoute from './routes/commissionRoute.js'
import supperAdminRoute from './routes/superAdminRoute.js'
import { endedAuctionCron } from './automation/endedAuctionCron.js'
import {verifyCommissionCron} from './automation/verifyCommissionCron.js'

dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
  }),
)
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  }),
)

// routers
app.use("/api/v1/user",userRoute)
app.use("/api/v1/auctionitem",auctionRoute)
app.use("/api/v1/bid",bidRoute)
app.use("/api/v1/commission",commissionRoute)
app.use("/api/v1/superadmin",supperAdminRoute)

endedAuctionCron()
verifyCommissionCron()

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log(`DB is connected`))
  .catch((err) => console.log(err))

app.use(errorMiddleware)

export default app