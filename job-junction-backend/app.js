const express = require("express");
const dotenv  = require("dotenv");
dotenv.config();

const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models/index");

// Route Imports
const authRoutes        = require("./routes/auth.routes");
const jobSeekerRoutes   = require("./routes/jobSeeker.routes");
const employerRoutes    = require("./routes/employer.routes");
const jobRoutes         = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes       = require("./routes/admin.routes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth",         authRoutes);
app.use("/api/job-seeker",   jobSeekerRoutes);
app.use("/api/employer",     employerRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin",        adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, msg: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

// Connect MySQL then start server
sequelize.authenticate()
  .then(() => {
    console.log("✅ MySQL connected");
    app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Job Junction running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  });
