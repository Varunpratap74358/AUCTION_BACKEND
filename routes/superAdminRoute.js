import express from "express";
import { isAuthenticated, isAuthorized } from "../midellware/auth.js";
import { deleteAuctionItem, deletePaymentProof, fetchAllUsers, getPaymentProofDetail, getPaymentProofs, monthlyRevenue, updateProofStatus } from "../constrollers/superAdminControler.js";

export const routes = express.Router()

routes.delete("/auctionitem/delete/:id",isAuthenticated,isAuthorized("Super Admin"),deleteAuctionItem);
routes.get("/paymentproofs/getall",isAuthenticated,isAuthorized("Super Admin"),getPaymentProofs);
routes.get("/paymentproof/:id",isAuthenticated,isAuthorized("Super Admin"),getPaymentProofDetail);
routes.put("/paymentproof/status/update/:id",isAuthenticated,isAuthorized("Super Admin"),updateProofStatus);
routes.delete("/paymentproof/delete/:id",isAuthenticated,isAuthorized("Super Admin"),deletePaymentProof);
routes.get("/users/getall",isAuthenticated,isAuthorized("Super Admin"),fetchAllUsers);
routes.get("/monthlyincome",isAuthenticated,isAuthorized("Super Admin"),monthlyRevenue);

export default routes