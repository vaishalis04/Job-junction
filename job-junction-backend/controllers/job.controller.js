const createError = require("http-errors");
const { Op } = require("sequelize");
const { Job, User } = require("../models/index");

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = { ...req.body, employer_id: req.userId };
      if (typeof data.skills_required === "string") {
        try { data.skills_required = JSON.parse(data.skills_required); } catch {}
      }
      const job = await Job.create(data);
      res.status(201).json({ success: true, msg: "Job posted successfully", job });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const { search, location, job_type, experience_level, category, page = 1, limit = 10 } = req.query;
      const where = { status: "active", is_inactive: false };

      if (location)         where.location         = { [Op.like]: `%${location}%` };
      if (job_type)         where.job_type         = job_type;
      if (experience_level) where.experience_level = experience_level;
      if (category)         where.category         = { [Op.like]: `%${category}%` };
      if (search) {
        where[Op.or] = [
          { title:       { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);
      const { count, rows: jobs } = await Job.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        limit: Number(limit),
        offset,
        include: [{ model: User, as: "employer", attributes: ["id", "name"] }],
      });

      res.json({ success: true, total: count, page: Number(page), limit: Number(limit), jobs });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const job = await Job.findOne({
        where: { id: req.params.id, is_inactive: false },
        include: [{ model: User, as: "employer", attributes: ["id", "name", "email"] }],
      });
      if (!job) throw createError.NotFound("Job not found");
      await job.increment("views");
      res.json({ success: true, job });
    } catch (err) {
      next(err);
    }
  },

  getMyJobs: async (req, res, next) => {
    try {
      const jobs = await Job.findAll({
        where: { employer_id: req.userId, is_inactive: false },
        order: [["created_at", "DESC"]],
      });
      res.json({ success: true, total: jobs.length, jobs });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const job = await Job.findOne({ where: { id: req.params.id, employer_id: req.userId } });
      if (!job) throw createError.NotFound("Job not found or not authorized");
      await job.update(req.body);
      res.json({ success: true, msg: "Job updated", job });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const job = await Job.findOne({ where: { id: req.params.id, employer_id: req.userId } });
      if (!job) throw createError.NotFound("Job not found or not authorized");
      await job.update({ is_inactive: true });
      res.json({ success: true, msg: "Job deleted" });
    } catch (err) {
      next(err);
    }
  },
};
