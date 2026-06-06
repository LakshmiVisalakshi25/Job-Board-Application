const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require("axios");
require('dotenv').config();

const app = express();

// ===============================
// MODELS
// ===============================
const Job = require('./models/Job');
const Bookmark = require('./models/Bookmark');
const User = require('./models/User');
const Application = require('./models/Application');

// ===============================
// PACKAGES
// ===============================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require("otp-generator");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ===============================
// GEMINI AI
// ===============================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ===============================
// SECRET
// ===============================
const SECRET = process.env.JWT_SECRET || "mysecretkey";

// ===============================
// OTP STORE
// ===============================
const otpStore = {};

// ===============================
// BREVO HTTP EMAIL SENDER
// ===============================
const sendEmail = async (to, subject, html) => {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "AI Job Portal", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
  return response;
};

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// ===============================
// JWT MIDDLEWARE
// ===============================
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===============================
// INSERT DEFAULT JOBS
// ===============================
const insertDefaultJobs = async () => {
  try {
    const count = await Job.countDocuments();
    if (count > 0) {
      console.log("Default jobs already exist");
      return;
    }
    const defaultJobs = [
      {
        title: "React Developer", company: "Infosys", location: "Hyderabad",
        salary: 60000, type: "Remote", skills: ["React", "JavaScript", "CSS"],
        description: "Build and maintain modern web applications using React. You will collaborate with designers and backend developers to deliver high-quality user interfaces. Strong understanding of component-based architecture required."
      },
      {
        title: "Node.js Developer", company: "TCS", location: "Bangalore",
        salary: 70000, type: "Hybrid", skills: ["Node.js", "MongoDB", "Express"],
        description: "Develop and maintain scalable server-side applications using Node.js and Express. Work with MongoDB databases and RESTful APIs. Experience with authentication and security best practices is a plus."
      },
      {
        title: "Full Stack Developer", company: "Wipro", location: "Chennai",
        salary: 85000, type: "Onsite", skills: ["React", "Node.js", "MongoDB"],
        description: "Design and develop full-stack web applications from frontend to backend. You will work across the entire tech stack using React, Node.js, and MongoDB. Strong problem-solving skills and attention to detail required."
      },
      {
        title: "Python Developer", company: "Capgemini", location: "Pune",
        salary: 75000, type: "Remote", skills: ["Python", "Django", "SQL"],
        description: "Develop backend services and APIs using Python and Django. Work with relational databases and write clean, maintainable code. Experience with REST APIs and SQL is essential."
      },
      {
        title: "Java Developer", company: "Tech Mahindra", location: "Vizag",
        salary: 65000, type: "Hybrid", skills: ["Java", "Spring Boot", "MySQL"],
        description: "Build enterprise-grade applications using Java and Spring Boot. Collaborate with cross-functional teams to deliver robust backend systems. MySQL database knowledge and OOP concepts are required."
      },
      {
        title: "Frontend Developer", company: "Google", location: "Hyderabad",
        salary: 120000, type: "Remote", skills: ["React", "Tailwind", "JavaScript"],
        description: "Create beautiful, responsive, and performant user interfaces for Google's web products. You will work with cutting-edge frontend technologies and contribute to large-scale systems serving millions of users."
      },
      {
        title: "Backend Engineer", company: "Amazon", location: "Bangalore",
        salary: 150000, type: "Onsite", skills: ["Node.js", "AWS", "MongoDB"],
        description: "Design and implement high-performance backend systems for Amazon's platform. You will work with distributed systems, AWS cloud services, and large-scale databases. Strong system design skills are essential."
      },
      {
        title: "Software Engineer", company: "Microsoft", location: "Noida",
        salary: 140000, type: "Hybrid", skills: ["C#", ".NET", "Azure"],
        description: "Develop and maintain enterprise software solutions using C# and .NET. Leverage Azure cloud services to build scalable applications. Collaborate with global teams and contribute to Microsoft's product ecosystem."
      },
      {
        title: "Data Analyst", company: "Deloitte", location: "Mumbai",
        salary: 80000, type: "Remote", skills: ["SQL", "Power BI", "Excel"],
        description: "Analyze large datasets to generate actionable business insights. Build dashboards and reports using Power BI and Excel. Strong SQL skills and experience with data visualization tools are required."
      },
      {
        title: "Machine Learning Engineer", company: "Accenture", location: "Pune",
        salary: 130000, type: "Hybrid", skills: ["Python", "TensorFlow", "AI"],
        description: "Design and deploy machine learning models to solve real-world business problems. Work with large datasets and deep learning frameworks like TensorFlow. A strong foundation in mathematics and statistics is essential."
      },
      {
        title: "DevOps Engineer", company: "IBM", location: "Chennai",
        salary: 110000, type: "Onsite", skills: ["Docker", "Kubernetes", "AWS"],
        description: "Manage CI/CD pipelines and cloud infrastructure for IBM's enterprise products. Work with Docker, Kubernetes, and AWS to ensure high availability and scalability. Strong scripting and automation skills required."
      },
      {
        title: "UI/UX Designer", company: "Adobe", location: "Delhi",
        salary: 90000, type: "Remote", skills: ["Figma", "UI Design", "UX"],
        description: "Design intuitive and visually compelling user experiences for Adobe's suite of products. Conduct user research, create wireframes, and develop high-fidelity prototypes using Figma. A strong portfolio is required."
      },
      {
        title: "Cloud Engineer", company: "Oracle", location: "Hyderabad",
        salary: 125000, type: "Hybrid", skills: ["Cloud", "AWS", "Linux"],
        description: "Architect and manage cloud infrastructure on AWS and Oracle Cloud. Ensure security, performance, and reliability of cloud-based systems. Linux administration and scripting experience are essential."
      },
      {
        title: "Android Developer", company: "Paytm", location: "Noida",
        salary: 95000, type: "Remote", skills: ["Kotlin", "Android", "Firebase"],
        description: "Build and optimize Android applications used by millions of Paytm users. Work with Kotlin, Firebase, and REST APIs to deliver fast and reliable mobile experiences. Experience with Play Store deployment is a plus."
      },
      {
        title: "iOS Developer", company: "Zoho", location: "Chennai",
        salary: 98000, type: "Hybrid", skills: ["Swift", "iOS", "Xcode"],
        description: "Develop feature-rich iOS applications for Zoho's product lineup. Work with Swift, UIKit, and Xcode to build high-performance mobile apps. Experience with App Store submission and Apple guidelines required."
      },
      {
        title: "Cyber Security Analyst", company: "HCL", location: "Bangalore",
        salary: 115000, type: "Onsite", skills: ["Cyber Security", "Networking", "Linux"],
        description: "Monitor, detect, and respond to security threats across HCL's infrastructure. Conduct vulnerability assessments and implement security controls. Strong knowledge of networking, Linux, and security frameworks required."
      },
      {
        title: "QA Engineer", company: "Cognizant", location: "Hyderabad",
        salary: 70000, type: "Remote", skills: ["Testing", "Selenium", "Automation"],
        description: "Design and execute automated and manual test cases for enterprise applications. Work with Selenium and testing frameworks to ensure software quality. Attention to detail and strong analytical skills are essential."
      },
      {
        title: "AI Engineer", company: "OpenAI", location: "Remote",
        salary: 200000, type: "Remote", skills: ["AI", "LLM", "Python"],
        description: "Research and develop cutting-edge AI systems and large language models at OpenAI. Work on training pipelines, evaluation frameworks, and deployment of AI models. A strong background in ML and Python is required."
      },
      {
        title: "Blockchain Developer", company: "Polygon", location: "Mumbai",
        salary: 160000, type: "Hybrid", skills: ["Blockchain", "Solidity", "Web3"],
        description: "Build decentralized applications and smart contracts on the Polygon blockchain. Work with Solidity, Web3.js, and DeFi protocols. Deep understanding of blockchain architecture and cryptography is required."
      },
      {
        title: "Game Developer", company: "Ubisoft", location: "Pune",
        salary: 100000, type: "Onsite", skills: ["Unity", "C#", "Game Design"],
        description: "Design and develop engaging game mechanics and systems using Unity and C#. Collaborate with artists and designers to bring game concepts to life. A passion for gaming and experience shipping titles is a big plus."
      }
    ];
    await Job.insertMany(defaultJobs);
    console.log("Default jobs inserted successfully ✅");
  } catch (err) {
    console.log("insertDefaultJobs error:", err.message);
  }
};

// ===============================
// MONGODB CONNECTION
// ===============================
console.log("Mongo URI:", process.env.MONGO_URI);
mongoose.connect(
  process.env.MONGO_URI ||
  'mongodb+srv://24a95a0517_db_user:Visalakshi%4025@cluster0.pjywmgu.mongodb.net/jobboard?retryWrites=true&w=majority'
)
.then(async () => {
  console.log("MongoDB Connected ✅");
  await insertDefaultJobs();
})
.catch(err => console.log("MongoDB error:", err.message));

// ===============================
// TEST ROUTE
// ===============================
app.get('/', (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// ===============================
// ONE-TIME MIGRATION — REMOVE AFTER USE
// ===============================
app.get('/api/migrate-descriptions', async (req, res) => {
  try {
    const descriptions = {
      "React Developer": "Build and maintain modern web applications using React. You will collaborate with designers and backend developers to deliver high-quality user interfaces. Strong understanding of component-based architecture required.",
      "Node.js Developer": "Develop and maintain scalable server-side applications using Node.js and Express. Work with MongoDB databases and RESTful APIs. Experience with authentication and security best practices is a plus.",
      "Full Stack Developer": "Design and develop full-stack web applications from frontend to backend. You will work across the entire tech stack using React, Node.js, and MongoDB. Strong problem-solving skills and attention to detail required.",
      "Python Developer": "Develop backend services and APIs using Python and Django. Work with relational databases and write clean, maintainable code. Experience with REST APIs and SQL is essential.",
      "Java Developer": "Build enterprise-grade applications using Java and Spring Boot. Collaborate with cross-functional teams to deliver robust backend systems. MySQL database knowledge and OOP concepts are required.",
      "Frontend Developer": "Create beautiful, responsive, and performant user interfaces for Google's web products. You will work with cutting-edge frontend technologies and contribute to large-scale systems serving millions of users.",
      "Backend Engineer": "Design and implement high-performance backend systems for Amazon's platform. You will work with distributed systems, AWS cloud services, and large-scale databases. Strong system design skills are essential.",
      "Software Engineer": "Develop and maintain enterprise software solutions using C# and .NET. Leverage Azure cloud services to build scalable applications. Collaborate with global teams and contribute to Microsoft's product ecosystem.",
      "Data Analyst": "Analyze large datasets to generate actionable business insights. Build dashboards and reports using Power BI and Excel. Strong SQL skills and experience with data visualization tools are required.",
      "Machine Learning Engineer": "Design and deploy machine learning models to solve real-world business problems. Work with large datasets and deep learning frameworks like TensorFlow. A strong foundation in mathematics and statistics is essential.",
      "DevOps Engineer": "Manage CI/CD pipelines and cloud infrastructure for IBM's enterprise products. Work with Docker, Kubernetes, and AWS to ensure high availability and scalability. Strong scripting and automation skills required.",
      "UI/UX Designer": "Design intuitive and visually compelling user experiences for Adobe's suite of products. Conduct user research, create wireframes, and develop high-fidelity prototypes using Figma. A strong portfolio is required.",
      "Cloud Engineer": "Architect and manage cloud infrastructure on AWS and Oracle Cloud. Ensure security, performance, and reliability of cloud-based systems. Linux administration and scripting experience are essential.",
      "Android Developer": "Build and optimize Android applications used by millions of Paytm users. Work with Kotlin, Firebase, and REST APIs to deliver fast and reliable mobile experiences. Experience with Play Store deployment is a plus.",
      "iOS Developer": "Develop feature-rich iOS applications for Zoho's product lineup. Work with Swift, UIKit, and Xcode to build high-performance mobile apps. Experience with App Store submission and Apple guidelines required.",
      "Cyber Security Analyst": "Monitor, detect, and respond to security threats across HCL's infrastructure. Conduct vulnerability assessments and implement security controls. Strong knowledge of networking, Linux, and security frameworks required.",
      "QA Engineer": "Design and execute automated and manual test cases for enterprise applications. Work with Selenium and testing frameworks to ensure software quality. Attention to detail and strong analytical skills are essential.",
      "AI Engineer": "Research and develop cutting-edge AI systems and large language models at OpenAI. Work on training pipelines, evaluation frameworks, and deployment of AI models. A strong background in ML and Python is required.",
      "Blockchain Developer": "Build decentralized applications and smart contracts on the Polygon blockchain. Work with Solidity, Web3.js, and DeFi protocols. Deep understanding of blockchain architecture and cryptography is required.",
      "Game Developer": "Design and develop engaging game mechanics and systems using Unity and C#. Collaborate with artists and designers to bring game concepts to life. A passion for gaming and experience shipping titles is a big plus."
    };

    let updated = 0;
    for (const [title, description] of Object.entries(descriptions)) {
      const result = await Job.updateMany({ title }, { $set: { description } });
      updated += result.modifiedCount;
    }

    res.json({ message: `✅ Updated ${updated} jobs with descriptions` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// GET ALL JOBS
// ===============================
app.get('/api/jobs', async (req, res) => {
  try {
    const { title, type } = req.query;
    let filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (type && type !== "all") filter.type = { $regex: `^${type}$`, $options: 'i' };
    const jobs = await Job.find(filter);
    res.json(jobs);
  } catch (err) {
    console.log("GET /api/jobs error:", err.message);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// ===============================
// GET SINGLE JOB BY ID
// ===============================
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    console.log("GET /api/jobs/:id error:", err.message);
    res.status(500).json({ message: "Error fetching job" });
  }
});

// ===============================
// ADD JOB — JWT PROTECTED
// ===============================
app.post('/api/jobs', verifyAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.json({ message: "Job added successfully" });
  } catch (err) {
    console.log("POST /api/jobs error:", err.message);
    res.status(500).json({ message: "Error adding job" });
  }
});

// ===============================
// DELETE ALL JOBS
// ===============================
app.delete('/api/jobs', async (req, res) => {
  try {
    await Job.deleteMany({});
    res.json({ message: "All jobs deleted" });
  } catch (err) {
    console.log("DELETE /api/jobs error:", err.message);
    res.status(500).json({ message: "Error deleting jobs" });
  }
});

// ===============================
// BOOKMARK JOB
// ===============================
app.post('/api/bookmarks', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const bookmark = new Bookmark({ userId, jobId });
    await bookmark.save();
    res.json({ message: "Bookmarked successfully" });
  } catch (err) {
    console.log("POST /api/bookmarks error:", err.message);
    res.status(500).json({ message: "Bookmark failed" });
  }
});

// ===============================
// GET BOOKMARKS
// ===============================
app.get('/api/bookmarks/:userId', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.params.userId });
    res.json(bookmarks);
  } catch (err) {
    console.log("GET /api/bookmarks error:", err.message);
    res.status(500).json({ message: "Error fetching bookmarks" });
  }
});

// ===============================
// REMOVE BOOKMARK
// ===============================
app.delete('/api/bookmarks', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    await Bookmark.deleteOne({ userId, jobId });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.log("DELETE /api/bookmarks error:", err.message);
    res.status(500).json({ message: "Error removing bookmark" });
  }
});

// ===============================
// REGISTER
// ===============================
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name, email,
      password: hashedPassword,
      role: req.body.role || "user"
    });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log("POST /api/register error:", err.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ===============================
// LOGIN
// ===============================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, userId: user._id, role: user.role, name: user.name });
  } catch (err) {
    console.log("POST /api/login error:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
});

// ===============================
// APPLY JOB
// ===============================
app.post('/api/apply', async (req, res) => {
  try {
    const { userId, jobId, name, email, phone, address, percentage, resume, photo } = req.body;
    const existing = await Application.findOne({ userId, jobId });
    if (existing && existing.status !== "Rejected") {
      return res.status(400).json({ message: "Already applied" });
    }
    if (existing && existing.status === "Rejected") {
      await Application.deleteOne({ _id: existing._id });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const application = new Application({
      userId, jobId, name, email,
      phone, address, percentage, resume, photo,
      status: "Pending"
    });
    await application.save();
    try {
      await sendEmail(
        email,
        "Application Submitted",
        `<h2>Hello ${name}</h2><p>You successfully applied for:</p><h3>${job.title}</h3><p>Company: ${job.company}</p><p>Status: Pending</p><br/><p>AI Job Portal 🚀</p>`
      );
    } catch (mailErr) {
      console.log("Apply email error:", mailErr.message);
    }
    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.log("POST /api/apply error:", err.message);
    res.status(500).json({ message: "Application failed" });
  }
});

// ===============================
// WITHDRAW APPLICATION
// ===============================
app.delete('/api/apply', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const application = await Application.findOne({ userId, jobId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    const job = await Job.findById(jobId);
    await Application.deleteOne({ userId, jobId });
    try {
      await sendEmail(
        application.email,
        "Application Withdrawn",
        `<h2>Hello ${application.name}</h2><p>You withdrew your application for:</p><h3>${job ? job.title : "the job"}</h3><br/><p>AI Job Portal</p>`
      );
    } catch (mailErr) {
      console.log("Withdraw email error:", mailErr.message);
    }
    res.json({ message: "Application withdrawn" });
  } catch (err) {
    console.log("DELETE /api/apply error:", err.message);
    res.status(500).json({ message: "Withdraw failed" });
  }
});

// ===============================
// USER APPLICATIONS
// ===============================
app.get('/api/user-applications/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.params.userId });
    res.json(applications);
  } catch (err) {
    console.log("GET /api/user-applications error:", err.message);
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// ===============================
// VIEW APPLICANTS
// ===============================
app.get('/api/applications/:jobId', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId });
    res.json(applications);
  } catch (err) {
    console.log("GET /api/applications error:", err.message);
    res.status(500).json({ message: "Error fetching applicants" });
  }
});

// ===============================
// AI CHATBOT
// ===============================
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required", jobs: [] });
    const userMessage = message.toLowerCase();
    const jobs = await Job.find();
    const jobsContext = jobs.map(job => `
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Skills: ${job.skills?.join(", ")}
    `).join("\n");
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI Career Assistant. You help students with jobs, resumes, coding, placements, internships, interviews. Answer professionally and shortly.\n\nAvailable jobs:\n${jobsContext}`
          },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Job Portal"
        }
      }
    );
    const aiReply = response.data.choices[0].message.content;
    const shouldShowJobs =
      userMessage.includes("job") || userMessage.includes("developer") ||
      userMessage.includes("react") || userMessage.includes("python") ||
      userMessage.includes("java") || userMessage.includes("node") ||
      userMessage.includes("hiring") || userMessage.includes("opening");
    res.json({ reply: aiReply, jobs: shouldShowJobs ? jobs : [] });
  } catch (err) {
    console.log("Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ reply: "AI server error occurred.", jobs: [] });
  }
});

// ===============================
// SEND OTP
// ===============================
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });
    otpStore[email] = { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log(`OTP for ${email}: ${otp}`);
    await sendEmail(
      email,
      "Password Reset OTP",
      `<h2>Your OTP Code</h2><h1 style="letter-spacing: 8px;">${otp}</h1><p>This OTP is valid for <b>10 minutes</b>.</p><p>If you did not request this, ignore this email.</p>`
    );
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log("Send OTP error:", err.message);
    res.status(500).json({ message: "Failed to send OTP: " + err.message });
  }
});

// ===============================
// RESET PASSWORD
// ===============================
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const storedOtp = otpStore[email];
    if (!storedOtp) return res.status(400).json({ message: "OTP not found. Please request a new one." });
    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    if (storedOtp.code !== otp) return res.status(400).json({ message: "Invalid OTP" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    delete otpStore[email];
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.log("Reset password error:", err.message);
    res.status(500).json({ message: "Password reset failed" });
  }
});

// ===============================
// GET USER PROFILE
// ===============================
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.log("GET /api/profile error:", err.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ===============================
// UPDATE USER PROFILE
// ===============================
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const { name, bio, college, skills, github, linkedin, profileImage } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, bio, college, skills, github, linkedin, profileImage },
      { returnDocument: "after" }
    ).select("-password");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.log("PUT /api/profile error:", err.message);
    res.status(500).json({ message: "Profile update failed" });
  }
});

// ===============================
// ADMIN ANALYTICS
// ===============================
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalBookmarks = await Bookmark.countDocuments();
    const topApplied = await Application.aggregate([
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    let mostAppliedJob = "No applications yet";
    if (topApplied.length > 0) {
      const job = await Job.findById(topApplied[0]._id);
      if (job) mostAppliedJob = job.title;
    }
    res.json({ totalJobs, totalUsers, totalApplications, totalBookmarks, mostAppliedJob });
  } catch (err) {
    console.log("GET /api/admin/analytics error:", err.message);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
});

// ===============================
// UPDATE APPLICATION STATUS
// ===============================
app.put("/api/application-status", async (req, res) => {
  try {
    const { applicationId, status, email, name } = req.body;
    if (!applicationId || !status) {
      return res.status(400).json({ message: "applicationId and status are required" });
    }
    await Application.findByIdAndUpdate(applicationId, { status, updatedAt: new Date() });
    let message = "";
    if (status === "Shortlisted") message = `<h2>Congratulations ${name} 🎉</h2><p>You are shortlisted for the next round.</p>`;
    else if (status === "Rejected") message = `<h2>Hello ${name}</h2><p>Your application was not selected.</p>`;
    else if (status === "Selected") message = `<h2>Congratulations ${name} 🚀</h2><p>You have been selected for the job.</p>`;
    else message = `<h2>Hello ${name}</h2><p>Your application is under review.</p>`;
    try {
      await sendEmail(email, `Application Status: ${status}`, message);
    } catch (mailErr) {
      console.log("Status email error:", mailErr.message);
    }
    res.json({ message: `Application marked as ${status}` });
  } catch (err) {
    console.log("PUT /api/application-status error:", err.message);
    res.status(500).json({ message: "Status update failed" });
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});