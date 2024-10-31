import express from "express";
import { isAuthenticated, isAuthorized } from "../midellware/auth.js";
import { proofCommission } from "../constrollers/commissionControler.js";

const route = express.Router()

route.post("/proof",isAuthenticated,isAuthorized("Auctioner"),proofCommission)

export default route