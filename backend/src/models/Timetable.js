import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            classId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Class",
                  required: true,
                  unique: true // One timetable per class
            },
            // Schedule structure:
            // {
            //   "Monday": [ { subject: "Math", startTime: "09:00", endTime: "10:00", teacher: "Name" }, ... ],
            //   "Tuesday": ...
            // }
            schedule: {
                  type: Map,
                  of: [
                        {
                              subject: { type: String, required: true },
                              startTime: { type: String, required: true },
                              endTime: { type: String, required: true },
                              teacher: { type: String } // Optional teacher name override or reference
                        }
                  ],
                  default: {}
            },
            // Master list of periods for this class
            periods: [
                  {
                        periodNumber: { type: Number },
                        startTime: { type: String, required: true },
                        endTime: { type: String, required: true }
                  }
            ]
      },
      { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
