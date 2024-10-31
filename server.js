import app from "./app.js";
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
dotenv.config()

cloudinary.v2.config({
    api_key:process.env.COUDINARY_API_KEY,
    api_secret:process.env.COUDINARY_API_SECRET,
    cloud_name:process.env.COUDINARY_CLOUD_NAME
})



app.listen(process.env.PORT,()=>{
    console.log(`Server running on ${process.env.port}`)
})

// console.log(new Date("Fri Oct 11 2024 19:13:11 GMT-0700"))