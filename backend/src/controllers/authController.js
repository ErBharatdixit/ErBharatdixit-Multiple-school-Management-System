import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
            expiresIn: "30d"
      });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Admin (for creating users)
export const register = async (req, res) => {
      try {

            const { name, email, password, role, schoolId, phone } = req.body;

            // Check if user exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                  console.log('❌ User already exists:', email);
                  return res.status(400).json({ message: "User already exists" });
            }

            // Create user
            const user = await User.create({
                  name,
                  email,
                  password,
                  role,
                  schoolId,
                  phone
            });

            console.log('✅ User created successfully:', user.email);

            if (user) {
                  res.status(201).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId,
                        classId: user.classId,
                        token: generateToken(user._id)
                  });
            }
      } catch (error) {
            console.error('❌ Registration error:', error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
      try {
            console.log('🔐 Login attempt:', req.body.email);
            const { email, password } = req.body;

            // Check for user and populate classId
            const user = await User.findOne({ email }).populate('classId', 'name grade section');

            if (user && (await user.comparePassword(password))) {
                  console.log('✅ Login successful:', email);
                  res.json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId,
                        classId: user.classId,
                        rollNo: user.rollNo,
                        token: generateToken(user._id)
                  });
            } else {
                  console.log('❌ Invalid credentials:', email);
                  res.status(401).json({ message: "Invalid email or password" });
            }
      } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
      try {
            const user = await User.findById(req.user._id).select("-password").populate("classId", "name grade section");
            res.json(user);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
