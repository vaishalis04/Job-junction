const createError = require("http-errors");
const { Op } = require("sequelize");
const { Job, User } = require("../models/index");
const {getDateCutoff} = require("../helpers/helperFunction");

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
      const {
        // search
        search,
        // filters
        job_type,
        department,
        experience_level,
        nature_of_business,
        date_posted,
        location,
        // sort
        sort_by = "latest",
        // pagination
        page  = 1,
        limit = 10,
      } = req.query;

      const where = { status: "active", is_inactive: false };

      if (search) {
        where[Op.or] = [
          { title:       { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { location:    { [Op.like]: `%${search}%` } },
        ];
      }


      if (job_type) {
        const types = job_type.split(",").map((t) => t.trim()).filter(Boolean);
        where.job_type = types.length === 1 ? types[0] : { [Op.in]: types };
      }

      if (department) {
        const depts = department.split(",").map((d) => d.trim()).filter(Boolean);
        where.department = depts.length === 1 ? depts[0] : { [Op.in]: depts };
      }

      if (experience_level) {
        const levels = experience_level.split(",").map((l) => l.trim()).filter(Boolean);
        where.experience_level = levels.length === 1 ? levels[0] : { [Op.in]: levels };
      }

      if (nature_of_business) {
        const nobs = nature_of_business.split(",").map((n) => n.trim()).filter(Boolean);
        where.nature_of_business = nobs.length === 1 ? nobs[0] : { [Op.in]: nobs };
      }

      if (location) {
        where.location = { [Op.like]: `%${location}%` };
      }

      const cutoff = getDateCutoff(date_posted);
      if (cutoff) {
        where.created_at = { [Op.gte]: cutoff };
      }

      const sortMap = {
        latest:      [["created_at", "DESC"]],
        oldest:      [["created_at", "ASC"]],
        salary_high: [["salary_max", "DESC"]],
        salary_low:  [["salary_min", "ASC"]],
        most_viewed: [["views", "DESC"]],
      };
      const order = sortMap[sort_by] || sortMap.latest;

      const pageNum  = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit))); // cap at 50
      const offset   = (pageNum - 1) * limitNum;

      const { count, rows: jobs } = await Job.findAndCountAll({
        where,
        order,
        limit:  limitNum,
        offset,
        include: [{ model: User, as: "employer", attributes: ["id", "name"] }],
      });

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        total:       count,
        page:        pageNum,
        limit:       limitNum,
        total_pages: totalPages,
        has_next:    pageNum < totalPages,
        has_prev:    pageNum > 1,
        jobs,
      });
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
      const {
        search,
        status,
        sort_by = "latest",
        page    = 1,
        limit   = 10,
      } = req.query;

      const where = { employer_id: req.userId, is_inactive: false };
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { title:    { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
        ];
      }

      const sortMap = {
        latest:      [["created_at", "DESC"]],
        oldest:      [["created_at", "ASC"]],
        most_viewed: [["views", "DESC"]],
      };
      const order    = sortMap[sort_by] || sortMap.latest;
      const pageNum  = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));
      const offset   = (pageNum - 1) * limitNum;

      const { count, rows: jobs } = await Job.findAndCountAll({
        where,
        order,
        limit: limitNum,
        offset,
      });

      res.json({
        success:     true,
        total:       count,
        page:        pageNum,
        limit:       limitNum,
        total_pages: Math.ceil(count / limitNum),
        jobs,
      });
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