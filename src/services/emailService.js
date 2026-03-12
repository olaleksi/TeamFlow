import dotenv from 'dotenv';
import nodemailer from 'nodemailer'

// Load environment variables from .env file
dotenv.config({ path: "../../.env" });

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Function to send verification email
export const sendVerificationEmail = async (email, name, token) => {


  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}/auth/verify/${token}`;
  
try {
  const info = await transporter.sendMail({
    from: `Team Flow <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your account",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Welcome to TeamFlow, ${name}!</h2>
    <p>Thank you for registering. Please verify your email address to get started.</p>
    <div style="margin: 30px 0;">
      <a href="${verificationLink}" target="_blank"
         style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 4px; display: inline-block;">
        Verify Email Address
      </a>
    </div>
    <p>Or copy and paste this link: ${verificationLink}</p>
    <p>This link will expire in 24 hours.</p>
    <hr>
    <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
  </div>`,
  });
  return{ success: true, messageId: info.messageId }
} catch (error) {
  console.error("Email Verification Error:", error.message);
  throw new Error("Failed to send verification email");
}
};


export const sendTaskAssignmentEmail = async (email, assignedBy, taskTitle, projectName, taskUrl) => {
  
  // Validate required fields
  if(!email || !taskUrl || !assignedBy || !taskTitle || !projectName) {
    throw new Error("Missing required fields for task assignment email");
  }

  try {
    const info = await transporter.sendMail({
      from: `"TeamFlow" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `New Task: ${taskTitle} Assigned`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Task Assigned to You!</h2>
      <p><strong>${assignedBy}</strong> has assigned you a new task:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${taskTitle}</h3>
        <p style="margin: 0; color: #666;">Project: ${projectName}</p>
      </div>
      <div style="margin: 30px 0;">
        <a href="${taskUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          View Task
        </a>
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">You're receiving this because you're a member of TeamFlow.</p>
    </div>`,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Task Assignment Email Error:", error.message);
    throw new Error("Failed to send task assignment email");
  }
};

