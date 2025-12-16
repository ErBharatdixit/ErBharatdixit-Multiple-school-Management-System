import Notice from "../models/Notice.js";

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin)
export const createNotice = async (req, res) => {
      try {
            const { title, content, targetAudience } = req.body;

            const notice = await Notice.create({
                  schoolId: req.user.schoolId,
                  postedBy: req.user._id,
                  title,
                  content,
                  targetAudience: targetAudience || "all"
            });

            res.status(201).json(notice);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get notices relevant to the user
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res) => {
      try {
            const { role, schoolId } = req.user;

            let filter = { schoolId };

            // Filtering based on role
            if (role === "admin" || role === "superadmin") {
                  // Admin sees all notices for the school
            } else if (role === "teacher") {
                  // Teachers see "all" and "teacher" notices
                  filter.targetAudience = { $in: ["all", "teacher"] };
            } else if (role === "student") {
                  // Students see "all" and "student" notices
                  filter.targetAudience = { $in: ["all", "student"] };
            }

            const notices = await Notice.find(filter)
                  .sort({ createdAt: -1 })
                  .populate("postedBy", "name role");

            res.json(notices);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
export const deleteNotice = async (req, res) => {
      try {
            const notice = await Notice.findById(req.params.id);

            if (!notice) {
                  return res.status(404).json({ message: "Notice not found" });
            }

            // Ensure only admin of the same school can delete
            if (notice.schoolId.toString() !== req.user.schoolId.toString()) {
                  return res.status(401).json({ message: "Not authorized" });
            }

            await notice.deleteOne();
            res.json({ message: "Notice removed" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
