const createError = require("http-errors");
const { User, Job, Application, JobSeekerProfile, EmployerProfile } = require("../models/index");

module.exports = {
  getDashboardStats: async (req, res, next) => {
    try {
      const [totalUsers, totalJobs, totalApplications, activeJobs] = await Promise.all([
        User.count({ where: { is_inactive: false } }),
        Job.count({ where: { is_inactive: false } }),
        Application.count({ where: { is_withdrawn: false } }),
        Job.count({ where: { status: "active", is_inactive: false } }),
      ]);
      res.json({ success: true, stats: { totalUsers, totalJobs, totalApplications, activeJobs } });
    } catch (err) {
      next(err);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const { role, page = 1, limit = 20 } = req.query;
      const where = {};
      if (role) where.role = role;
      const offset = (Number(page) - 1) * Number(limit);
      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ["password"] },
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
      });
      res.json({ success: true, total: count, users });
    } catch (err) {
      next(err);
    }
  },

  toggleUserStatus: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.userId);
      if (!user) throw createError.NotFound("User not found");
      await user.update({ is_inactive: !user.is_inactive });
      res.json({ success: true, msg: `User ${user.is_inactive ? "deactivated" : "activated"}` });
    } catch (err) {
      next(err);
    }
  },

  getAllJobs: async (req, res, next) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const where = { is_inactive: false };
      if (status) where.status = status;
      const offset = (Number(page) - 1) * Number(limit);
      const { count, rows: jobs } = await Job.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
        include: [{ model: User, as: "employer", attributes: ["name", "email"] }],
      });
      res.json({ success: true, total: count, jobs });
    } catch (err) {
      next(err);
    }
  },

  verifyEmployer: async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({ where: { user_id: req.params.userId } });
      if (!profile) throw createError.NotFound("Employer profile not found");
      await profile.update({ is_verified: true });
      res.json({ success: true, msg: "Employer verified" });
    } catch (err) {
      next(err);
    }
  },

  getTopJobSeekers: async (req, res, next) => {
    try {
      const profiles = await JobSeekerProfile.findAll({
        where: { is_inactive: false },
        order: [["completeness_score", "DESC"]],
        limit: 50,
        include: [{ model: User, as: "user", attributes: ["name", "email", "mobile"] }],
      });
      res.json({ success: true, profiles });
    } catch (err) {
      next(err);
    }
  },
};
