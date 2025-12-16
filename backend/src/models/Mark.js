import mongoose from "mongoose";

const markSchema = new mongoose.Schema({
      studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true
      },
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      marksObtained: {
            type: Number,
            required: true,
            min: 0
      },
      grade: {
            type: String,
            enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
            required: true
      },
      percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
      },
      remarks: {
            type: String
      },
      enteredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      }
}, {
      timestamps: true
});

// Compound index to prevent duplicate marks
markSchema.index({ studentId: 1, examId: 1 }, { unique: true });

// Calculate grade based on percentage
markSchema.methods.calculateGrade = function (percentage) {
      if (percentage >= 90) return "A+";
      if (percentage >= 80) return "A";
      if (percentage >= 70) return "B+";
      if (percentage >= 60) return "B";
      if (percentage >= 50) return "C+";
      if (percentage >= 40) return "C";
      if (percentage >= 33) return "D";
      return "F";
};

export default mongoose.model("Mark", markSchema);
