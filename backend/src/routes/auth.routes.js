import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { validate as validateEmail } from 'deep-email-validator'; 
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_ai_interviewer_key";

const transporter = nodemailer.createTransport({
  service: 'gmail',
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
      validateSMTP: false // Off for local development to prevent Google blocking
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

    // 🔴 DEV MODE BYPASS: Instead of sending the email and timing out, 
    // we print the OTP to the Railway logs and immediately tell the frontend it succeeded.
    console.log(`\n🚨 [DEV MODE] User ${email} registered.`);
    console.log(`🚨 [DEV MODE] Their 6-digit verification code is: ${otp}\n`);
    
    return res.json({ message: "A 6-digit code has been sent to your email." });

    /* --- REAL EMAIL CODE COMMENTED OUT UNTIL GMAIL APP PASSWORD IS SET UP ---
    const mailOptions = { ... };
    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: "A 6-digit code has been sent to your email." });
    } catch (mailError) {
      console.error("Mail Error:", mailError.message);
      return res.status(500).json({ error: "Failed to send email. Check backend terminal for details." });
    }
    */

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

    // 🔴 DEV MODE BYPASS: Commenting out the welcome email to prevent background timeouts
    /*
    const welcomeMailOptions = { ... };
    transporter.sendMail(welcomeMailOptions).catch(err => {
      console.error("Failed to send welcome email:", err);
    });
    */

    console.log(`✅ [DEV MODE] User ${email} successfully verified and logged in!`);

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