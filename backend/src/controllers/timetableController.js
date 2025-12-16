import Timetable from "../models/Timetable.js";

// @desc    Create or Update Timetable for a Class
// @route   POST /api/timetable
// @access  Private/Admin
export const createOrUpdateTimetable = async (req, res) => {
      try {
            const { classId, schedule, periods } = req.body;

            if (!classId || !schedule) {
                  return res.status(400).json({ message: "Class ID and Schedule are required" });
            }

            // Upsert: Find one by classId and update, or create if not exists
            const timetable = await Timetable.findOneAndUpdate(
                  { classId, schoolId: req.user.schoolId },
                  {
                        schoolId: req.user.schoolId,
                        classId,
                        schedule,
                        periods: periods || []
                  },
                  { new: true, upsert: true } // Return new doc, create if missing
            );

            res.status(200).json(timetable);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Timetable by Class ID
// @route   GET /api/timetable/:classId
// @access  Private (Admin, Teacher, Student)
export const getTimetable = async (req, res) => {
      try {
            const { classId } = req.params;

            const timetable = await Timetable.findOne({
                  classId,
                  schoolId: req.user.schoolId
            });

            if (!timetable) {
                  // Return empty structure instead of 404 to simplify frontend
                  return res.status(200).json({
                        classId,
                        schedule: {},
                        periods: []
                  });
            }

            res.json(timetable);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Timetable for Logged-in Teacher
// @route   GET /api/timetable/teacher/me
// @access  Private (Teacher)
export const getTeacherSchedule = async (req, res) => {
      try {
            // Fetch all timetables for the school
            const timetables = await Timetable.find({ schoolId: req.user.schoolId })
                  .populate("classId", "name grade section");

            const teacherName = req.user.name;
            const mySchedule = {};

            // Initialize days
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(day => {
                  mySchedule[day] = [];
            });

            // Iterate through all class timetables
            timetables.forEach(timetable => {
                  if (!timetable.schedule) return;

                  // timetable.schedule is a Map. Convert to object or iterate entries.
                  // Mongoose Map: timetable.schedule.get("Monday")

                  for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
                        const daySchedule = timetable.schedule.get(day);
                        if (daySchedule && Array.isArray(daySchedule)) {
                              daySchedule.forEach((period) => {
                                    if (period.teacher === teacherName) {
                                          mySchedule[day].push({
                                                ...period._doc || period, // Handle mongoose subdoc
                                                className: timetable.classId?.name || "Unknown Class",
                                                classId: timetable.classId?._id
                                          });
                                    }
                              });
                        }
                  }
            });

            // Sort each day by start time
            for (const day in mySchedule) {
                  mySchedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
            }

            res.json(mySchedule);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
