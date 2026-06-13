const createError = require("http-errors");
const { EmployerProfile, User } = require("../models/index");

module.exports = {
  upsertProfile: async (req, res, next) => {
    try {
      const updateData = { ...req.body };
      if (req.files?.company_logo?.[0]) updateData.company_logo = req.files.company_logo[0].path;
      if (typeof updateData.social_links === "string") {
        try { updateData.social_links = JSON.parse(updateData.social_links); } catch {}
      }

      const [profile, created] = await EmployerProfile.findOrCreate({
        where: { user_id: req.userId },
        defaults: { user_id: req.userId, ...updateData },
      });

      if (!created) await profile.update(updateData);

      res.json({ success: true, msg: "Employer profile updated", profile });
    } catch (err) {
      next(err);
    }
  },

  getMyProfile: async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({
        where: { user_id: req.userId },
        include: [{ model: User, as: "user", attributes: ["name", "email", "mobile"] }],
      });
      if (!profile) throw createError.NotFound("Employer profile not found");
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  },

  getProfileById: async (req, res, next) => {
    try {
      const profile = await EmployerProfile.findOne({
        where: { user_id: req.params.userId, is_inactive: false },
        include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      });
      if (!profile) throw createError.NotFound("Employer not found");
      res.json({ success: true, profile });
    } catch (err) {
      next(err);
    }
  },
};
