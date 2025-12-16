import School from "../models/School.js";

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private/SuperAdmin
export const getSchools = async (req, res) => {
      try {
            const schools = await School.find();
            res.json(schools);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get list of schools (public for signup)
// @route   GET /api/schools/list
// @access  Public
export const getSchoolList = async (req, res) => {
      try {
            const schools = await School.find().select("name _id");
            res.json(schools);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get single school
// @route   GET /api/schools/:id
// @access  Private
export const getSchool = async (req, res) => {
      try {
            const school = await School.findById(req.params.id);

            if (!school) {
                  return res.status(404).json({ message: "School not found" });
            }

            res.json(school);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Create school
// @route   POST /api/schools
// @access  Private/SuperAdmin
export const createSchool = async (req, res) => {
      try {
            const school = await School.create(req.body);
            res.status(201).json(school);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update school
// @route   PUT /api/schools/:id
// @access  Private/SuperAdmin
export const updateSchool = async (req, res) => {
      try {
            const school = await School.findByIdAndUpdate(
                  req.params.id,
                  req.body,
                  { new: true, runValidators: true }
            );

            if (!school) {
                  return res.status(404).json({ message: "School not found" });
            }

            res.json(school);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete school
// @route   DELETE /api/schools/:id
// @access  Private/SuperAdmin
export const deleteSchool = async (req, res) => {
      try {
            const school = await School.findByIdAndDelete(req.params.id);

            if (!school) {
                  return res.status(404).json({ message: "School not found" });
            }

            res.json({ message: "School deleted successfully" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get dashboard stats
// @route   GET /api/schools/stats
// @access  Private/SuperAdmin
export const getDashboardStats = async (req, res) => {
      try {
            const totalSchools = await School.countDocuments();

            // Dynamic import to avoid circular dependency if models import each other, 
            // though strictly not needed if models are independent.
            // Using standard import at top is better, but I will add imports at top of file in a separate edit or let auto-import handle if possible.
            // For now, I'll assume models are imported or will add them.
            // Wait, I need to add imports for User and Class.

            const User = (await import("../models/User.js")).default;
            const Class = (await import("../models/Class.js")).default;

            const totalUsers = await User.countDocuments({ role: { $in: ["teacher", "student"] } });
            const totalClasses = await Class.countDocuments();

            res.json({
                  schools: totalSchools,
                  users: totalUsers,
                  classes: totalClasses
            });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
