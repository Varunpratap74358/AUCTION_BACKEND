import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema({
    amount:Number,
    user: mongoose.Schema.Types.ObjectId,

},{timestamps:true})

export const Commission = mongoose.model("Commission",commissionSchema)