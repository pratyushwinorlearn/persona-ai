import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validate as validateEmail } from 'deep-email-validator'; 
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_ai_interviewer_key";

// The Bulletproof Cloud Config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Explicitly force the secure SMTP port
  secure: true, // Use SSL/TLS
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// --- 1. REGISTER (Sends OTP) ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const validation = await validateEmail({
      email: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false // Kept false to prevent Google DNS blocking on cloud servers
    });

    if (!validation.valid) {
      let errorMsg = "Invalid email format.";
      if (validation.reason === 'mx') {
        errorMsg = "This email domain does not exist or cannot receive mail.";
      } else if (validation.reason === 'disposable') {
        errorMsg = "Disposable emails are not allowed.";
      }
      return res.status(400).json({ error: errorMsg });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000); 

    await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        otp: otp,
        otpExpires: expires,
        isVerified: false
      }
    });

    // 🟢 PRODUCTION MODE: Send the actual OTP Email
    const mailOptions = {
      from: `"Persona AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${otp} is your Persona AI verification code`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #000; color: #fff; border-radius: 12px; text-align: center; border: 1px solid #333;">
          <h2 style="color: #7DF9C2; letter-spacing: 2px;">VERIFICATION CODE</h2>
          <p style="color: #aaa; font-size: 16px;">Enter the code below to activate your account.</p>
          <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; margin: 30px 0; color: #fff;">${otp}</div>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "A 6-digit code has been sent to your email." });
    } catch (mailError) {
      console.error("Mail Error:", mailError.message);
      return res.status(500).json({ error: "Failed to send email. Check backend terminal for details." });
    }

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
});

// --- 2. VERIFY OTP & SEND WELCOME EMAIL ---
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findFirst({ 
      where: { 
        email, 
        otp,
        otpExpires: { gt: new Date() } 
      } 
    });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    // Mark as verified and wipe the OTP data
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otp: null, otpExpires: null }
    });

    // 🟢 PRODUCTION MODE: Shoot off the Welcome Email! 
    // We don't 'await' this so the user logs in instantly without waiting for the email to send.
    const welcomeMailOptions = {
      from: `"Persona AI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Persona AI! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0d0d0d; color: #ffffff; border-radius: 12px; border: 1px solid #222;">
          <h1 style="color: #7DF9C2; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Welcome, ${user.name}!</h1>
          <p style="font-size: 16px; line-height: 1.7; color: #cccccc;">
            Your email has been successfully verified, and your account is now active.
          </p>
          <p style="font-size: 16px; line-height: 1.7; color: #cccccc; margin-bottom: 30px;">
            Payton is ready when you are. Head back to the dashboard to start your first dynamic interview simulation.
          </p>
          <div style="padding-top: 20px; border-top: 1px solid #333;">
            <p style="font-size: 12px; color: #666;">
              © ${new Date().getFullYear()} Persona AI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    transporter.sendMail(welcomeMailOptions).catch(err => {
      console.error("Failed to send welcome email:", err);
    });

    // Log the user in
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Verification failed." });
  }
});

// --- 3. LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.isVerified) {
      return res.status(403).json({ error: "Account not verified. Please register again to receive a code." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in." });
  }
});

// --- 4. HISTORY ROUTES ---
router.get('/history', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const history = await prisma.interviewHistory.findMany({
        where: { userId: decoded.id },
        orderBy: { createdAt: 'desc' }
      });
      res.json(history.map(h => ({
        id: h.id,
        date: new Date(h.createdAt).toLocaleDateString(),
        jobRole: h.jobRole,
        experienceLevel: h.experienceLevel,
        questionLimit: h.questionLimit,
        score: h.overallScore || 0
      })));
    } catch (error) { res.status(500).json({ error: "Failed to fetch history" }); }
});

router.get('/history/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const interview = await prisma.interviewHistory.findFirst({
        where: { id: Number(req.params.id), userId: decoded.id },
        include: { answers: { orderBy: { id: 'asc' } } }
      });
      if (!interview) return res.status(404).json({ error: "Not found" });
      res.json(interview);
    } catch (error) { res.status(500).json({ error: "Failed to fetch details" }); }
});

export default router;