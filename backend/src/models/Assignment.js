import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            teacherId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            classId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Class",
                  required: true,
            },
            subjectId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Subject",
                  required: true,
            },
            title: {
                  type: String,
                  required: true,
                  trim: true,
            },
            description: {
                  type: String,
                  required: true,
            },
            dueDate: {
                  type: Date,
                  required: true,
            },
            totalPoints: {
                  type: Number,
                  default: 100,
            },
            attachments: [
                  {
                        url: String,
                        publicId: String,
                        name: String, // Original filename
                        type: { type: String }, // 'image' or 'document'
                  },
            ],
      },
      { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
