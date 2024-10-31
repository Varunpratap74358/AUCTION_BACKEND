import express from "express";
import { addNewAuctionItem, getAllAuctionItem, getAuctionDetails, getMyAuctionItem, removeFromAuction, republishItem } from "../constrollers/auctionItemControler.js";
import {isAuthenticated, isAuthorized} from '../midellware/auth.js'
import { trackCommissionStatus } from "../midellware/trackCommissionStatus.js";
const route = express.Router()

route.post("/create",isAuthenticated,isAuthorized("Auctioner"),trackCommissionStatus,addNewAuctionItem)
route.get("/allitems",getAllAuctionItem);
route.get("/auction/:id",isAuthenticated,getAuctionDetails)
route.get("/myitems",isAuthenticated,isAuthorized("Auctioner"),getMyAuctionItem)
route.delete("/delete/:id",isAuthenticated,isAuthorized("Auctioner" || "Super Admin"),removeFromAuction)
route.put("/item/republish/:id",isAuthenticated,isAuthorized("Auctioner"),republishItem)


export default route