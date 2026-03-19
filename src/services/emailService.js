import dotenv from 'dotenv';
import { transporter } from '../config/email.js';

// Load environment variables from .env file
dotenv.config({ path: "../../.env" });



export const sendVerificationEmail = async (email, token) => {

const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  
 transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your account",
      html: `<h2> Welcome to Team Flow </h2>
  <p> Click <a href="${verificationLink}">here</a> to verify your account </p>`
   }, (error, info) => {
      if (error) {
         console.log("An error occured:", error);
      }
      console.log("Email sent successfully", info.response);
   })
}

export const sendTaskAssignmentEmail = (email, taskTitle) => {
 transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "New Task Assigned",
  html: `<h2>You have been assigned a new task: <b>${taskTitle}</b></h2>`
}, (error, info) => {
    if (error) {
       console.log("An error occured: ", error)
    }
       console.log("Email Sent Successfully", info.response)
  })
}
