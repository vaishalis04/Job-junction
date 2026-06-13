const createError = require("http-errors");
const { Application, Job, User, JobSeekerProfile } = require("../models/index");

module.exports = {
  apply: async (req, res, next) => {
    try {
      const job = await Job.findOne({ where: { id: req.params.jobId, status: "active", is_inactive: false } });
      if (!job) throw createError.NotFound("Job not available");

      const existing = await Application.findOne({ where: { job_id: req.params.jobId, applicant_id: req.userId } });
      if (existing) throw createError.Conflict("You have already applied to this job");

      const resumePath = req.file ? req.file.path : req.body.resume;
      const application = await Application.create({
        job_id: req.params.jobId,
        applicant_id: req.userId,
        resume: resumePath,
        cover_letter: req.body.cover_letter,
      });

      res.status(201).json({ success: true, msg: "Application submitted", application });
    } catch (err) {
      next(err);
    }
  },

  getMyApplications: async (req, res, next) => {
    try {
      const applications = await Application.findAll({
        where: { applicant_id: req.userId, is_withdrawn: false },
        order: [["created_at", "DESC"]],
        include: [{ model: Job, as: "job", attributes: ["id", "title", "location", "job_type", "employer_id"] }],
      });
      res.json({ success: true, total: applications.length, applications });
    } catch (err) {
      next(err);
    }
  },

  withdraw: async (req, res, next) => {
    try {
      const app = await Application.findOne({ where: { id: req.params.id, applicant_id: req.userId } });
      if (!app) throw createError.NotFound("Application not found");
      await app.update({ is_withdrawn: true });
      res.json({ success: true, msg: "Application withdrawn" });
    } catch (err) {
      next(err);
    }
  },

  getJobApplications: async (req, res, next) => {
    try {
      const job = await Job.findOne({ where: { id: req.params.jobId, employer_id: req.userId } });
      if (!job) throw createError.Forbidden("Not authorized");

      const applications = await Application.findAll({
        where: { job_id: req.params.jobId, is_withdrawn: false },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "applicant",
            attributes: ["id", "name", "email", "mobile"],
            include: [{ model: JobSeekerProfile, as: "seekerProfile", attributes: ["completeness_score", "completeness_tier", "headline", "skills", "resume"] }],
          },
        ],
      });

      res.json({ success: true, total: applications.length, applications });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status, employer_notes } = req.body;
      const app = await Application.findByPk(req.params.id, {
        include: [{ model: Job, as: "job", attributes: ["employer_id"] }],
      });
      if (!app) throw createError.NotFound("Application not found");
      if (app.job.employer_id !== req.userId) throw createError.Forbidden("Not authorized");

      await app.update({ status, ...(employer_notes && { employer_notes }) });
      res.json({ success: true, msg: "Application status updated", application: app });
    } catch (err) {
      next(err);
    }
  },
};
