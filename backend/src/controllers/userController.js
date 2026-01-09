import User from "../models/User.js";
import Class from "../models/Class.js";

// @desc    Create a new teacher
// @route   POST /api/users/teacher
// @access  Private/Admin
export const createTeacher = async (req, res) => {
      try {
            const { name, email, password, phone, subject, salaryDetails } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                  return res.status(400).json({ message: "User already exists" });
            }

            const user = await User.create({
                  name,
                  email,
                  password,
                  role: "teacher",
                  schoolId: req.user.schoolId,
                  phone,
                  subject,
                  salaryDetails
            });

            if (user) {
                  res.status(201).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId,
                        subject: user.subject
                  });
            } else {
                  res.status(400).json({ message: "Invalid user data" });
            }
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update teacher details
// @route   PUT /api/users/teacher/:id
// @access  Private/Admin
// @desc    Update teacher details
// @route   PUT /api/users/teacher/:id
// @access  Private/Admin
export const updateTeacher = async (req, res) => {
      try {
            const { name, phone, email, subject, salaryDetails } = req.body;


            const teacher = await User.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId,
                  role: "teacher"
            });

            if (!teacher) {
                  return res.status(404).json({ message: "Teacher not found" });
            }

            // check for duplicate email if email is being updated
            if (email && email !== teacher.email) {
                  const emailExists = await User.findOne({ email, _id: { $ne: teacher._id } });
                  if (emailExists) {
                        return res.status(400).json({ message: "Email already in use" });
                  }
            }

            teacher.name = name || teacher.name;
            teacher.phone = phone || teacher.phone;
            teacher.email = email || teacher.email;
            teacher.subject = subject || teacher.subject;

            if (salaryDetails) {
                  teacher.salaryDetails = {
                        basicSalary: Number(salaryDetails.basicSalary) || 0,
                        allowances: Number(salaryDetails.allowances) || 0,
                        deductions: Number(salaryDetails.deductions) || 0
                  };
            }

            await teacher.save();

            res.json({
                  _id: teacher._id,
                  name: teacher.name,
                  email: teacher.email,
                  role: teacher.role,
                  phone: teacher.phone,
                  subject: teacher.subject,
                  salaryDetails: teacher.salaryDetails
            });
      } catch (error) {
            console.error("Error updating teacher:", error);
            res.status(500).json({ message: error.message, stack: error.stack });
      }
};

// @desc    Create a new student
// @route   POST /api/users/student
// @access  Private/Admin
export const createStudent = async (req, res) => {
      try {
            const { name, email, password, phone, className, rollNo } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                  return res.status(400).json({ message: "User already exists" });
            }

            const user = await User.create({
                  name,
                  email,
                  password,
                  role: "student",
                  schoolId: req.user.schoolId,
                  phone,
                  classId: className,
                  rollNo
            });

            if (user) {
                  // Add student to class's students array
                  if (className) {
                        await Class.findByIdAndUpdate(
                              className,
                              { $addToSet: { students: user._id } },
                              { new: true }
                        );
                  }

                  res.status(201).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId,
                  });
            } else {
                  res.status(400).json({ message: "Invalid user data" });
            }
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update student details
// @route   PUT /api/users/student/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
      try {
            const { name, phone, email, className, rollNo } = req.body;

            const student = await User.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId,
                  role: "student"
            });

            if (!student) {
                  return res.status(404).json({ message: "Student not found" });
            }

            const oldClassId = student.classId;

            student.name = name || student.name;
            student.phone = phone || student.phone;
            student.email = email || student.email;
            if (className) student.classId = className;
            student.rollNo = rollNo || student.rollNo;

            await student.save();

            // Update class relationships if class changed
            if (className && className !== oldClassId?.toString()) {
                  // Remove from old class
                  if (oldClassId) {
                        await Class.findByIdAndUpdate(
                              oldClassId,
                              { $pull: { students: student._id } }
                        );
                  }
                  // Add to new class
                  await Class.findByIdAndUpdate(
                        className,
                        { $addToSet: { students: student._id } }
                  );
            }

            res.json({
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  role: student.role,
                  classId: student.classId,
                  rollNo: student.rollNo
            });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete user (teacher/student)
// @desc    Get all staff
// @route   GET /api/users/staff
// @access  Private/Admin
export const getStaff = async (req, res) => {
      try {
            const staff = await User.find({
                  role: { $in: ["staff", "teacher"] },
                  schoolId: req.user.schoolId
            }).select("-password");
            res.json(staff);
      } catch (error) {
            res.status(500).json({ message: "Server error" });
      }
};

// @desc    Create Staff
// @route   POST /api/users/staff
// @access  Private/Admin
export const createStaff = async (req, res) => {
      try {
            console.log("CREATE STAFF REQUEST:", req.body);
            console.log("REQUESTING USER:", req.user);

            const { name, email, password, phone, designation, salaryDetails } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: "User already exists" });

            const user = await User.create({
                  name,
                  email,
                  password,
                  phone,
                  designation,
                  role: "staff",
                  schoolId: req.user.schoolId,
                  salaryDetails: {
                        basicSalary: Number(salaryDetails?.basicSalary) || 0,
                        allowances: Number(salaryDetails?.allowances) || 0,
                        deductions: Number(salaryDetails?.deductions) || 0
                  }
            });

            res.status(201).json({ message: "Staff created successfully", user });
      } catch (error) {
            console.error("Create Staff Error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
      }
};

// @desc    Update Staff
// @route   PUT /api/users/staff/:id
// @access  Private/Admin
export const updateStaff = async (req, res) => {
      try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.designation = req.body.designation || user.designation;
            if (req.body.salaryDetails) user.salaryDetails = req.body.salaryDetails;
            if (req.body.password) user.password = req.body.password;

            await user.save();
            res.json({ message: "Staff updated successfully", user });
      } catch (error) {
            res.status(500).json({ message: "Server error" });
      }
};

// @desc    Delete user (teacher/student/staff)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
      try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            await user.deleteOne();
            res.json({ message: "User removed" });
      } catch (error) {
            res.status(500).json({ message: "Server error" });
      }
};

// @desc    Get all teachers for the current school
// @route   GET /api/users/teachers
// @access  Private/Admin
export const getTeachers = async (req, res) => {
      try {
            const teachers = await User.find({
                  schoolId: req.user.schoolId,
                  role: "teacher"
            }).select("-password");
            res.json(teachers);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all students for the current school
// @route   GET /api/users/students
// @access  Private/Admin/Teacher
export const getStudents = async (req, res) => {
      try {
            const query = {
                  schoolId: req.user.schoolId,
                  role: "student"
            };

            // Optional filter by classId
            if (req.query.classId) {
                  query.classId = req.query.classId;
            }

            const students = await User.find(query)
                  .select("-password")
                  .populate("classId", "name grade section");
            res.json(students);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all parents for the current school
// @route   GET /api/users/parents
// @access  Private/Admin
export const getParents = async (req, res) => {
      try {
            const parents = await User.find({
                  schoolId: req.user.schoolId,
                  role: "parent"
            })
                  .select("-password")
                  .populate("children", "name classId rollNo");
            res.json(parents);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Create a new parent
// @route   POST /api/users/parent
// @access  Private/Admin
export const createParent = async (req, res) => {
      try {
            console.log("Create Parent Request Body:", req.body);
            const { name, email, password, phone, children } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                  return res.status(400).json({ message: "User already exists with this email" });
            }

            const user = await User.create({
                  name,
                  email,
                  password,
                  role: "parent",
                  schoolId: req.user.schoolId,
                  phone,
                  children: children || [] // Array of student IDs
            });

            console.log("Parent Created:", user);

            if (user) {
                  res.status(201).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId,
                        children: user.children
                  });
            } else {
                  res.status(400).json({ message: "Invalid user data" });
            }
      } catch (error) {
            console.error("Create Parent Error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update parent details
// @route   PUT /api/users/parent/:id
// @access  Private/Admin
export const updateParent = async (req, res) => {
      try {
            const { name, phone, email, children } = req.body;

            const parent = await User.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId,
                  role: "parent"
            });

            if (!parent) {
                  return res.status(404).json({ message: "Parent not found" });
            }

            if (email && email !== parent.email) {
                  const emailExists = await User.findOne({ email, _id: { $ne: parent._id } });
                  if (emailExists) {
                        return res.status(400).json({ message: "Email already in use" });
                  }
            }

            parent.name = name || parent.name;
            parent.phone = phone || parent.phone;
            parent.email = email || parent.email;
            if (children) parent.children = children;

            if (req.body.password) parent.password = req.body.password;

            await parent.save();

            res.json({
                  _id: parent._id,
                  name: parent.name,
                  email: parent.email,
                  role: parent.role,
                  phone: parent.phone,
                  children: parent.children
            });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
