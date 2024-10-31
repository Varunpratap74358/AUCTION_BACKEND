import express from "express";
import { isAuthenticated, isAuthorized } from "../midellware/auth.js";
import { placedItem } from "../constrollers/bidControler.js";
import { checkAuctionEndTime } from "../midellware/checkAuctionEndTime.js";

const routers = express.Router()

routers.post("/place/:id",isAuthenticated,isAuthorized("Bidder"),checkAuctionEndTime,placedItem)

export default routers