import express from "express";
import { fetchLeaderboard, getUserProfile, login, logout, register } from "../constrollers/userControler.js";
import { isAuthenticated } from "../midellware/auth.js";

const routers = express.Router()

routers.post("/register",register)
routers.post("/login",login)
routers.get("/me",isAuthenticated,getUserProfile);
routers.get("/logout",isAuthenticated,logout);
routers.get("/leaderboard",isAuthenticated,fetchLeaderboard);


export default routers