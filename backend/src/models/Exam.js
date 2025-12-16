import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true
      },
      examType: {
            type: String,
            enum: ["Mid-Term", "Final", "Quiz", "Unit Test", "Assignment"],
            required: true
      },
      subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
      },
      classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
      },
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      date: {
            type: Date,
            required: true
      },
      totalMarks: {
            type: Number,
            required: true,
            min: 0
      },
      passingMarks: {
            type: Number,
            required: true,
            min: 0
      },
      duration: {
            type: Number, // in minutes
            required: true
      },
      instructions: {
            type: String
      },
      isActive: {
            type: Boolean,
            default: true
      }
}, {
      timestamps: true
});

// Index for efficient queries
examSchema.index({ classId: 1, subjectId: 1, date: 1 });

export default mongoose.model("Exam", examSchema);
