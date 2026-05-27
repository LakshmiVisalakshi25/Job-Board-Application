
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
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const {
  GoogleGenerativeAI
} = require("@google/generative-ai");

// ===============================
// GEMINI AI
// ===============================
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

// ===============================
// SECRET
// ===============================
const SECRET = "mysecretkey";
// ===============================
// OTP STORE
// ===============================
const otpStore = {};

// ===============================
// NODEMAILER
// ===============================
const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS

    }

  });
// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// INSERT DEFAULT JOBS
// ===============================
const insertDefaultJobs = async () => {

  try {

    // Check existing jobs
    const count =
      await Job.countDocuments();

    // If jobs already exist
    if (count > 0) {

      console.log(
        "Default jobs already exist"
      );

      return;
    }

    // Default jobs
    const defaultJobs = [

  {
    title: "React Developer",
    company: "Infosys",
    location: "Hyderabad",
    salary: 60000,
    type: "Remote",
    skills: ["React", "JavaScript", "CSS"]
  },

  {
    title: "Node.js Developer",
    company: "TCS",
    location: "Bangalore",
    salary: 70000,
    type: "Hybrid",
    skills: ["Node.js", "MongoDB", "Express"]
  },

  {
    title: "Full Stack Developer",
    company: "Wipro",
    location: "Chennai",
    salary: 85000,
    type: "Onsite",
    skills: ["React", "Node.js", "MongoDB"]
  },

  {
    title: "Python Developer",
    company: "Capgemini",
    location: "Pune",
    salary: 75000,
    type: "Remote",
    skills: ["Python", "Django", "SQL"]
  },

  {
    title: "Java Developer",
    company: "Tech Mahindra",
    location: "Vizag",
    salary: 65000,
    type: "Hybrid",
    skills: ["Java", "Spring Boot", "MySQL"]
  },

  {
    title: "Frontend Developer",
    company: "Google",
    location: "Hyderabad",
    salary: 120000,
    type: "Remote",
    skills: ["React", "Tailwind", "JavaScript"]
  },

  {
    title: "Backend Engineer",
    company: "Amazon",
    location: "Bangalore",
    salary: 150000,
    type: "Onsite",
    skills: ["Node.js", "AWS", "MongoDB"]
  },

  {
    title: "Software Engineer",
    company: "Microsoft",
    location: "Noida",
    salary: 140000,
    type: "Hybrid",
    skills: ["C#", ".NET", "Azure"]
  },

  {
    title: "Data Analyst",
    company: "Deloitte",
    location: "Mumbai",
    salary: 80000,
    type: "Remote",
    skills: ["SQL", "Power BI", "Excel"]
  },

  {
    title: "Machine Learning Engineer",
    company: "Accenture",
    location: "Pune",
    salary: 130000,
    type: "Hybrid",
    skills: ["Python", "TensorFlow", "AI"]
  },

  {
    title: "DevOps Engineer",
    company: "IBM",
    location: "Chennai",
    salary: 110000,
    type: "Onsite",
    skills: ["Docker", "Kubernetes", "AWS"]
  },

  {
    title: "UI/UX Designer",
    company: "Adobe",
    location: "Delhi",
    salary: 90000,
    type: "Remote",
    skills: ["Figma", "UI Design", "UX"]
  },

  {
    title: "Cloud Engineer",
    company: "Oracle",
    location: "Hyderabad",
    salary: 125000,
    type: "Hybrid",
    skills: ["Cloud", "AWS", "Linux"]
  },

  {
    title: "Android Developer",
    company: "Paytm",
    location: "Noida",
    salary: 95000,
    type: "Remote",
    skills: ["Kotlin", "Android", "Firebase"]
  },

  {
    title: "iOS Developer",
    company: "Zoho",
    location: "Chennai",
    salary: 98000,
    type: "Hybrid",
    skills: ["Swift", "iOS", "Xcode"]
  },

  {
    title: "Cyber Security Analyst",
    company: "HCL",
    location: "Bangalore",
    salary: 115000,
    type: "Onsite",
    skills: ["Cyber Security", "Networking", "Linux"]
  },

  {
    title: "QA Engineer",
    company: "Cognizant",
    location: "Hyderabad",
    salary: 70000,
    type: "Remote",
    skills: ["Testing", "Selenium", "Automation"]
  },

  {
    title: "AI Engineer",
    company: "OpenAI",
    location: "Remote",
    salary: 200000,
    type: "Remote",
    skills: ["AI", "LLM", "Python"]
  },

  {
    title: "Blockchain Developer",
    company: "Polygon",
    location: "Mumbai",
    salary: 160000,
    type: "Hybrid",
    skills: ["Blockchain", "Solidity", "Web3"]
  },

  {
    title: "Game Developer",
    company: "Ubisoft",
    location: "Pune",
    salary: 100000,
    type: "Onsite",
    skills: ["Unity", "C#", "Game Design"]
  }

];

    // Insert jobs
    await Job.insertMany(defaultJobs);

    console.log(
      "Default jobs inserted successfully ✅"
    );

  } catch (err) {

    console.log(err);
  }
};

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose.connect(
  'mongodb+srv://24a95a0517_db_user:Visalakshi%4025@cluster0.pjywmgu.mongodb.net/jobboard?retryWrites=true&w=majority'
)
.then(async () => {

  console.log("MongoDB Connected ✅");

  await insertDefaultJobs();

})
.catch(err =>
  console.log(err)
);

// ===============================
// TEST ROUTE
// ===============================
app.get('/', (req, res) => {

  res.send(
    "Backend is running successfully 🚀"
  );
});

// ===============================
// GET JOBS
// ===============================
app.get('/api/jobs', async (req, res) => {

  try {

    const { title, type } = req.query;

    let filter = {};

    // Search
    if (title) {

      filter.title = {
        $regex: title,
        $options: 'i'
      };
    }

    // Filter type
    if (
      type &&
      type !== "all"
    ) {

      filter.type = {
        $regex: `^${type}$`,
        $options: 'i'
      };
    }

    const jobs = await Job.find(filter);

    res.json(jobs);

  } catch (err) {

    res.status(500).json({
      message: "Error fetching jobs"
    });
  }
});

// ===============================
// ADD JOB
// ===============================
app.post('/api/jobs', async (req, res) => {

  try {

    const { role } = req.body;

    // Admin only
    if (role !== "admin") {

      return res.status(403).json({
        message: "Access denied"
      });
    }

    const job = new Job(req.body);

    await job.save();

    res.json({
      message: "Job added successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Error adding job"
    });
  }
});

// ===============================
// DELETE ALL JOBS
// ===============================
app.delete('/api/jobs', async (req, res) => {

  try {

    await Job.deleteMany({});

    res.json({
      message: "All jobs deleted"
    });

  } catch (err) {

    res.status(500).json({
      message: "Error deleting jobs"
    });
  }
});

// ===============================
// BOOKMARK JOB
// ===============================
app.post('/api/bookmarks', async (req, res) => {

  try {

    const {
      userId,
      jobId
    } = req.body;

    const bookmark =
      new Bookmark({
        userId,
        jobId
      });

    await bookmark.save();

    res.json({
      message:
        "Bookmarked successfully"
    });

  } catch (err) {

    res.status(500).json({
      message:
        "Bookmark failed"
    });
  }
});

// ===============================
// GET BOOKMARKS
// ===============================
app.get(
  '/api/bookmarks/:userId',
  async (req, res) => {

    try {

      const bookmarks =
        await Bookmark.find({
          userId:
            req.params.userId
        });

      res.json(bookmarks);

    } catch (err) {

      res.status(500).json({
        message:
          "Error fetching bookmarks"
      });
    }
  }
);

// ===============================
// REMOVE BOOKMARK
// ===============================
app.delete('/api/bookmarks',
  async (req, res) => {

    try {

      const {
        userId,
        jobId
      } = req.body;

      await Bookmark.deleteOne({
        userId,
        jobId
      });

      res.json({
        message:
          "Bookmark removed"
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Error removing bookmark"
      });
    }
  }
);

// ===============================
// REGISTER
// ===============================
app.post('/api/register',
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;

      // Existing user
      const existingUser =
        await User.findOne({
          email
        });

      if (existingUser) {

        return res.status(400).json({
          message:
            "User already exists"
        });
      }

      // Hash password
      const hashedPassword =
        await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: req.body.role || "user"
      });

      await user.save();

      res.json({
        message:
          "User registered successfully"
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          "Registration failed"
      });
    }
  }
);

// ===============================
// LOGIN
// ===============================
app.post('/api/login',
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;

      // Find user
      const user =
        await User.findOne({
          email
        });

      if (!user) {

        return res.status(400).json({
          message:
            "User not found"
        });
      }

      // Compare password
      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res.status(400).json({
          message:
            "Wrong password"
        });
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        SECRET,
        {
          expiresIn: "1d"
        }
      );

      res.json({
        token,
        userId: user._id,
        role: user.role,
        name: user.name
      });

    } catch (err) {

      res.status(500).json({
        message:
          "Login failed"
      });
    }
  }
);

// ===============================
// APPLY JOB
// ===============================
app.post(
  '/api/apply',
  async (req, res) => {

    try {

      const {

        userId,

        jobId,

        name,

        email,

        phone,

        address,

        percentage,

        resume,

        photo

      } = req.body;

      // CHECK ALREADY APPLIED
      const existing =
        await Application.findOne({
          userId,
          jobId
        });

      if (existing) {

        return res.json({

          message:
            "Already applied"

        });
      }

      // FIND JOB
      const job =
        await Job.findById(jobId);

      // SAVE APPLICATION
      const application =
        new Application({

          userId,

          jobId,

          name,

          email,

          phone,

          address,

          percentage,

          resume,

          photo,

          status:
            "Pending"

        });

      await application.save();

      // ===============================
      // EMAIL NOTIFICATION
      // ===============================
      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to: email,

        subject:
          "Application Submitted",

        html: `

          <h2>Hello ${name}</h2>

          <p>You successfully applied for:</p>

          <h3>${job.title}</h3>

          <p>Company: ${job.company}</p>

          <p>Status: Pending</p>

          <br/>

          <p>AI Job Portal 🚀</p>

        `

      });

      res.json({

        message:
          "Application submitted successfully"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Application failed"

      });
    }
  }
);
// ===============================
// WITHDRAW APPLICATION
// ===============================
app.delete(
  '/api/apply',
  async (req, res) => {

    try {

      const {
        userId,
        jobId
      } = req.body;

      // FIND APPLICATION
      const application =
        await Application.findOne({

          userId,

          jobId

        });

      if (!application) {

        return res.status(404).json({

          message:
            "Application not found"

        });
      }

      // FIND JOB
      const job =
        await Job.findById(jobId);

      // DELETE
      await Application.deleteOne({

        userId,

        jobId

      });

      // EMAIL
      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to:
          application.email,

        subject:
          "Application Withdrawn",

        html: `

          <h2>Hello ${application.name}</h2>

          <p>You withdrew your application for:</p>

          <h3>${job.title}</h3>

          <br/>

          <p>AI Job Portal</p>

        `

      });

      res.json({

        message:
          "Application withdrawn"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Withdraw failed"

      });
    }
  }
);
// ===============================
// USER APPLICATIONS
// ===============================
app.get(
  '/api/user-applications/:userId',
  async (req, res) => {

    try {

      const applications =
        await Application.find({
          userId:
            req.params.userId
        });

      res.json(applications);

    } catch (err) {

      res.status(500).json({
        message:
          "Error fetching applications"
      });
    }
  }
);
// ===============================
// VIEW APPLICANTS
// ===============================
app.get(
  '/api/applications/:jobId',
  async (req, res) => {

    try {

      const applications =
        await Application.find({
          jobId:
            req.params.jobId
        });

      res.json(applications);

    } catch (err) {

      res.status(500).json({
        message:
          "Error fetching applicants"
      });
    }
  }
);

// ===============================
// REAL AI CHATBOT
// ===============================
app.post(
  "/api/chatbot",
  async (req, res) => {

    try {

      const { message } = req.body;

      // Convert message to lowercase
      const userMessage =
        message.toLowerCase();

      // Fetch jobs
      const jobs = await Job.find();

      // Create jobs context
      const jobsContext =
        jobs.map(job => `
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Skills: ${job.skills?.join(", ")}
        `).join("\n");

      // OpenRouter API
      const response =
        await axios.post(

          "https://openrouter.ai/api/v1/chat/completions",

          {

            model:
              "openai/gpt-3.5-turbo",

            messages: [

              {
                role: "system",

                content:
                  `You are an AI Career Assistant.

You help students with:
- jobs
- resumes
- coding
- placements
- internships
- interviews

Answer professionally and shortly.

Available jobs:
${jobsContext}`
              },

              {
                role: "user",
                content: message
              }

            ]

          },

          {

            headers: {

              Authorization:
                `Bearer ${process.env.OPENROUTER_API_KEY}`,

              "Content-Type":
                "application/json"

            }

          }

        );

      // AI Reply
      const aiReply =
        response.data
          .choices[0]
          .message.content;

      // ===============================
      // SHOW JOBS ONLY FOR JOB QUERIES
      // ===============================
      const shouldShowJobs =

        userMessage.includes("job") ||
        userMessage.includes("developer") ||
        userMessage.includes("react") ||
        userMessage.includes("python") ||
        userMessage.includes("java") ||
        userMessage.includes("node") ||
        userMessage.includes("hiring") ||
        userMessage.includes("opening");

      // ===============================
      // RESPONSE
      // ===============================
      res.json({

        reply: aiReply,

        jobs:
          shouldShowJobs
            ? jobs
            : []

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        reply:
          "AI server error occurred.",

        jobs: []

      });
    }
  }
);
// ===============================
// SEND OTP
// ===============================
app.post(
  "/api/send-otp",
  async (req, res) => {

    try {

      const { email } =
        req.body;

      // CHECK USER
      const user =
        await User.findOne({
          email
        });

      if (!user) {

        return res.status(400).json({

          message:
            "User not found"

        });
      }

      // GENERATE OTP
      const otp =
        otpGenerator.generate(
          6,
          {

            upperCaseAlphabets:
              false,

            lowerCaseAlphabets:
              false,

            specialChars:
              false

          }
        );

      // SAVE OTP
      otpStore[email] = otp;

      // SEND EMAIL
      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to: email,

        subject:
          "Password Reset OTP",

        html: `

          <h2>Your OTP Code</h2>

          <h1>${otp}</h1>

          <p>Use this OTP to reset your password.</p>

        `

      });

      res.json({

        message:
          "OTP sent successfully"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Failed to send OTP"

      });
    }
  }
);

// ===============================
// RESET PASSWORD
// ===============================
app.post(
  "/api/reset-password",
  async (req, res) => {

    try {

      const {

        email,

        otp,

        newPassword

      } = req.body;

      // VERIFY OTP
      if (
        otpStore[email] !== otp
      ) {

        return res.status(400).json({

          message:
            "Invalid OTP"

        });
      }

      // HASH PASSWORD
      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      // UPDATE PASSWORD
      await User.updateOne(

        { email },

        {
          password:
            hashedPassword
        }

      );

      // REMOVE OTP
      delete otpStore[email];

      res.json({

        message:
          "Password reset successful"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Password reset failed"

      });
    }
  }
);
// ===============================
// GET USER PROFILE
// ===============================
app.get(
  "/api/profile/:userId",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        ).select("-password");

      if (!user) {

        return res.status(404).json({

          message:
            "User not found"

        });
      }

      res.json(user);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Failed to fetch profile"

      });
    }
  }
);

// ===============================
// UPDATE USER PROFILE
// ===============================
app.put(
  "/api/profile/:userId",
  async (req, res) => {

    try {

      const {

        name,

        bio,

        college,

        skills,

        github,

        linkedin,

        profileImage

      } = req.body;

      const updatedUser =
        await User.findByIdAndUpdate(

          req.params.userId,

          {

            name,

            bio,

            college,

            skills,

            github,

            linkedin,

            profileImage

          },

          {

            returnDocument: "after"

          }

        ).select("-password");

      res.json({

        message:
          "Profile updated successfully",

        user:
          updatedUser

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Profile update failed"

      });
    }
  }
);
// ===============================
// ADMIN ANALYTICS
// ===============================
app.get(
  "/api/admin/analytics",
  async (req, res) => {

    try {

      // TOTALS
      const totalJobs =
        await Job.countDocuments();

      const totalUsers =
        await User.countDocuments();

      const totalApplications =
        await Application.countDocuments();

      const totalBookmarks =
        await Bookmark.countDocuments();

      // MOST APPLIED JOB
      const topApplied =
        await Application.aggregate([

          {
            $group: {

              _id: "$jobId",

              count: {
                $sum: 1
              }

            }
          },

          {
            $sort: {
              count: -1
            }
          },

          {
            $limit: 1
          }

        ]);

      let mostAppliedJob =
        "No applications yet";

      if (topApplied.length > 0) {

        const job =
          await Job.findById(
            topApplied[0]._id
          );

        if (job) {

          mostAppliedJob =
            job.title;
        }
      }

      // RESPONSE
      res.json({

        totalJobs,

        totalUsers,

        totalApplications,

        totalBookmarks,

        mostAppliedJob

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Analytics fetch failed"

      });
    }
  }
);
// ===============================
// UPDATE APPLICATION STATUS
// ===============================
app.put(
  "/api/application-status",
  async (req, res) => {

    try {

      const {

        applicationId,

        status,

        email,

        name

      } = req.body;

      // UPDATE
      await Application.findByIdAndUpdate(

        applicationId,

        {

          status,

          updatedAt:
            new Date()

        }

      );

      // EMAIL CONTENT
      let message = "";

      if (status === "Shortlisted") {

        message = `

          <h2>Congratulations ${name} 🎉</h2>

          <p>You are shortlisted for the next round.</p>

        `;
      }

      else if (status === "Rejected") {

        message = `

          <h2>Hello ${name}</h2>

          <p>Your application was not selected.</p>

        `;
      }

      else if (status === "Selected") {

        message = `

          <h2>Congratulations ${name} 🚀</h2>

          <p>You have been selected for the job.</p>

        `;
      }

      else {

        message = `

          <h2>Hello ${name}</h2>

          <p>Your application is under review.</p>

        `;
      }

      // SEND EMAIL
      await transporter.sendMail({

        from:
          process.env.EMAIL_USER,

        to: email,

        subject:
          `Application Status: ${status}`,

        html: message

      });

      res.json({

        message:
          `Application marked as ${status}`

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Status update failed"

      });
    }
  }
);
// ===============================
// START SERVER
// ===============================
const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );
});