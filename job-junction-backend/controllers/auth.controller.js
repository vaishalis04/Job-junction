const createError = require("http-errors");
const { User } = require("../models/index");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../helpers/jwt.helper");

module.exports = {
  signUp: async (req, res, next) => {
    try {
      const { name, email, mobile, password, role } = req.body;
      if (!name || !email || !password) throw createError.BadRequest("Name, email and password are required");

      const exists = await User.findOne({ where: { email: email.toLowerCase() } });
      if (exists) throw createError.Conflict("User already exists with this email");

      const user = await User.create({ name, email: email.toLowerCase(), mobile, password, role: role || "job_seeker" });
      const accessToken  = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.status(201).json({
        success: true,
        msg: "Registration Successful",
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, mobile, password } = req.body;
      if ((!email && !mobile) || !password) throw createError.BadRequest("Email/mobile and password are required");

      const where = email ? { email: email.toLowerCase() } : { mobile };
      const user = await User.findOne({ where });
      if (!user || user.is_inactive) throw createError.NotFound("User not registered");

      const isMatch = await user.isValidPassword(password);
      if (!isMatch) throw createError.Unauthorized("Invalid credentials");

      const accessToken  = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.status(200).json({
        success: true,
        msg: "Login Successful",
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest("Refresh token required");
      const userId       = await verifyRefreshToken(refreshToken);
      const accessToken  = await signAccessToken(userId);
      const newRefresh   = await signRefreshToken(userId);
      res.json({ success: true, accessToken, refreshToken: newRefresh });
    } catch (err) {
      next(err);
    }
  },

  profile: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) throw createError.NotFound("User not found");
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { current_password, new_password } = req.body;
      const user = await User.findByPk(req.userId);
      if (!user) throw createError.NotFound();
      const isMatch = await user.isValidPassword(current_password);
      if (!isMatch) throw createError.Unauthorized("Current password is incorrect");
      user.password = new_password;
      await user.save();
      res.json({ success: true, msg: "Password changed successfully" });
    } catch (err) {
      next(err);
    }
  },
};
