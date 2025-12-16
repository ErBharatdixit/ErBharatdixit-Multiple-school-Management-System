import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
      studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
      examType: {
            type: String,
            enum: ["quiz", "midterm", "final", "assignment", "project"],
            required: true
      },
      marksObtained: {
            type: Number,
            required: true,
            min: 0
      },
      totalMarks: {
            type: Number,
            required: true,
            min: 0
      },
      percentage: {
            type: Number
      },
      grade: {
            type: String
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

// Calculate percentage before saving
marksSchema.pre("save", function (next) {
      if (this.totalMarks > 0) {
            this.percentage = (this.marksObtained / this.totalMarks) * 100;

            // Calculate grade
            if (this.percentage >= 90) this.grade = "A+";
            else if (this.percentage >= 80) this.grade = "A";
            else if (this.percentage >= 70) this.grade = "B";
            else if (this.percentage >= 60) this.grade = "C";
            else if (this.percentage >= 50) this.grade = "D";
            else this.grade = "F";
      }
      next();
});

export default mongoose.model("Marks", marksSchema);
