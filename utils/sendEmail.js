import nodeMailer from 'nodemailer'

export const sendEmail = async({email,subject,message})=>{
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth:{
            user : process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD
        }
    })
    const option ={
        from: process.env.SMPT_MAIL,
        to: email,
        subject,
        text: message
    }
    await transporter.sendMail(option);
}