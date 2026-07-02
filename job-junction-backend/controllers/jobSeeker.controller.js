const createError = require("http-errors");
const { Op } = require("sequelize");
const { JobSeekerProfile, User,SavedJob, Job, sequelize  } = require("../models/index");


module.exports = {
  upsertProfile: async (req, res, next) => {
    try {
      const updateData = { ...req.body };
      if (req.files?.profile_picture?.[0]) updateData.profile_picture = req.files.profile_picture[0].path;
      if (req.files?.resume?.[0])          updateData.resume          = req.files.resume[0].path;

      // Parse JSON strings sent from form-data if needed
      ["skills", "languages", "education", "experience", "job_type_preference"].forEach((key) => {
        if (typeof updateData[key] === "string") {
          try { updateData[key] = JSON.parse(updateData[key]); } catch {}
        }
      });

      const [profile, created] = await JobSeekerProfile.findOrCreate({
        where: { user_id: req.userId },
        defaults: { user_id: req.userId, ...updateData },
      });

      if (!created) {
        await profile.update(updateData);
      }

      res.json({ success: true, msg: "Profile updated", profile });
    } catch (err) {
      next(err);
    }
  },

  getMyProfile: async (req, res, next) => {
    try {
      const profile = await JobSeekerProfile.findOne({
        where: { user_id: req.userId },
        include: [{ model: User, as: "user", attributes: ["name", "email", "mobile"] }],
      });
      if (!profile) throw createError.NotFound("Profile not found. Please complete your profile.");
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  },

  getProfileById: async (req, res, next) => {
    try {
      const profile = await JobSeekerProfile.findOne({
        where: { user_id: req.params.userId, is_inactive: false },
        include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      });
      if (!profile) throw createError.NotFound("Profile not found");
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  },

  updateEducation: async (req, res, next) => {
    try {
      const profile = await JobSeekerProfile.findOne({ where: { user_id: req.userId } });
      if (!profile) throw createError.NotFound("Profile not found");
      await profile.update({ education: req.body.education });
      res.json({ success: true, msg: "Education updated", education: profile.education });
    } catch (err) {
      next(err);
    }
  },

  updateExperience: async (req, res, next) => {
    try {
      const profile = await JobSeekerProfile.findOne({ where: { user_id: req.userId } });
      if (!profile) throw createError.NotFound("Profile not found");
      await profile.update({ experience: req.body.experience });
      res.json({ success: true, msg: "Experience updated", experience: profile.experience });
    } catch (err) {
      next(err);
    }
  },

  getRankedProfiles: async (req, res, next) => {
    try {
      const { skill, location, min_score } = req.query;
      const where = { is_inactive: false, is_available: true };

      if (location) where.location = { [Op.like]: `%${location}%` };
      if (min_score) where.completeness_score = { [Op.gte]: Number(min_score) };

      let profiles = await JobSeekerProfile.findAll({
        where,
        order: [["completeness_score", "DESC"]],
        include: [{ model: User, as: "user", attributes: ["name", "email", "mobile"] }],
      });

      if (skill) {
        const s = skill.toLowerCase();
        profiles = profiles.filter((p) => {
          const skills = p.skills || [];
          return skills.some((sk) => sk.toLowerCase().includes(s));
        });
      }

      res.json({ success: true, total: profiles.length, profiles });
    } catch (err) {
      next(err);
    }
  },

toggleSaveJob: async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ where: { id: jobId, is_inactive: false } });
    if (!job) throw createError.NotFound("Job not found");

    const existing = await SavedJob.findOne({
      where: { user_id: req.userId, job_id: jobId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, saved: false, msg: "Job removed from saved" });
    }

    await SavedJob.create({ user_id: req.userId, job_id: jobId });
    res.json({ success: true, saved: true, msg: "Job saved successfully" });
  } catch (err) {
    next(err);
  }
},

getSavedJobs: async (req, res, next) => {
  console.log("Inside getSavedJobs");
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const { count, rows: savedJobs } = await SavedJob.findAndCountAll({
      where: { user_id: req.userId },
      order: [["created_at", "DESC"]],
      limit:  limitNum,
      offset,
      include: [
        {
          model: Job,
          as: "job",
          required: true,                  
          where: { is_inactive: false },
          attributes: [
            "id", "title", "location", "job_type",
            "experience_level", "salary_min", "salary_max",
            "department", "status", "application_deadline", "created_at",
          ],
          include: [{ 
            model: User, 
            as: "employer", 
            attributes: ["id", "name"],
            required: false,                
          }],
        },
      ],
      distinct: true,                       
    });

    res.json({
      success:     true,
      total:       count,
      page:        pageNum,
      limit:       limitNum,
      total_pages: Math.ceil(count / limitNum),
      saved_jobs:  savedJobs,
    });
  } catch (err) {
    next(err);
  }
},

isJobSaved: async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const saved = await SavedJob.findOne({
      where: { user_id: req.userId, job_id: jobId },
    });
    res.json({ success: true, saved: !!saved });
  } catch (err) {
    next(err);
  }
},

searchSeekers: async (req, res, next) => {
  try {
    const {
      search,
      gender,
      location,
      job_type_preference,
      completeness_tier,
      is_available,
      min_score,
      max_score,
      min_salary,
      max_salary,
      skill,
      language,
      sort_by = "score_high",
      page  = 1,
      limit = 10,
    } = req.query;

    const where = { is_inactive: false };

    if (search) {
      where[Op.or] = [
        { headline: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    if (gender) {
      const genders = gender.split(",").map((g) => g.trim()).filter(Boolean);
      where.gender = genders.length === 1 ? genders[0] : { [Op.in]: genders };
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (completeness_tier) {
      const tiers = completeness_tier.split(",").map((t) => t.trim()).filter(Boolean);
      where.completeness_tier = tiers.length === 1 ? tiers[0] : { [Op.in]: tiers };
    }

    if (is_available !== undefined) {
      where.is_available = is_available === "true";
    }

    if (min_score || max_score) {
      where.completeness_score = {};
      if (min_score) where.completeness_score[Op.gte] = Number(min_score);
      if (max_score) where.completeness_score[Op.lte] = Number(max_score);
    }

    if (min_salary || max_salary) {
      where.expected_salary = {};
      if (min_salary) where.expected_salary[Op.gte] = Number(min_salary);
      if (max_salary) where.expected_salary[Op.lte] = Number(max_salary);
    }

    if (skill) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelize.literal(
          `JSON_SEARCH(LOWER(skills), 'one', '%${skill.toLowerCase()}%') IS NOT NULL`
        )
      );
    }

    if (language) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelize.literal(
          `JSON_SEARCH(LOWER(languages), 'one', '%${language.toLowerCase()}%') IS NOT NULL`
        )
      );
    }

    if (job_type_preference) {
      const prefs = job_type_preference.split(",").map((j) => j.trim().toLowerCase());
      where[Op.and] = where[Op.and] || [];
      prefs.forEach((pref) => {
        where[Op.and].push(
          sequelize.literal(
            `JSON_SEARCH(LOWER(job_type_preference), 'one', '${pref}') IS NOT NULL`
          )
        );
      });
    }

    const sortMap = {
      score_high:  [["completeness_score", "DESC"]],
      score_low:   [["completeness_score", "ASC"]],
      salary_high: [["expected_salary", "DESC"]],
      salary_low:  [["expected_salary", "ASC"]],
      latest:      [["created_at", "DESC"]],
      oldest:      [["created_at", "ASC"]],
    };
    const order = sortMap[sort_by] || sortMap.score_high;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const { count, rows: profiles } = await JobSeekerProfile.findAndCountAll({
      where,
      order,
      limit:    limitNum,
      offset,
      distinct: true,
      attributes: { exclude: ["resume"] },
      include: [{
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "mobile"],
      }],
    });

    res.json({
      success:     true,
      total:       count,
      page:        pageNum,
      limit:       limitNum,
      total_pages: Math.ceil(count / limitNum),
      profiles,
    });
  } catch (err) {
    next(err);
  }
},
};
