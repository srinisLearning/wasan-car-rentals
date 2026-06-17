"use server";

import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.GMAIL_APP_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Wasan Car Rentals" <${process.env.GMAIL_APP_USERNAME}>`,
      to,
      subject,
      html,
    });

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send email" };
  }
};