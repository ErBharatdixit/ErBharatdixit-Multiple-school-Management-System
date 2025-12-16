import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
      cloudinary: cloudinary.v2,
      params: {
            folder: "school_management_docs",
            allowed_formats: ["jpg", "png", "jpeg", "pdf"],
            resource_type: "auto",
      },
});

export const upload = multer({ storage: storage });

// @desc    Upsert Profile (Text + Files)
// @route   POST /api/profile
// @access  Private (Teacher/Student)
export const upsertProfile = async (req, res) => {
      try {
            const userId = req.user._id;
            const userRole = req.user.role;
            const schoolId = req.user.schoolId;

            const {
                  address,
                  qualification,
                  experience, // Teacher
                  fathersName,
                  mothersName,
                  dob, // Student
            } = req.body;

            // Handle Files
            // req.files is an object thanks to upload.fields()
            // e.g. { photo: [file], adhar: [file], ... }

            let profile = await Profile.findOne({ userId });

            if (!profile) {
                  profile = new Profile({
                        userId,
                        schoolId,
                        role: userRole,
                        documents: [],
                  });
            }

            // Update Text Fields
            if (address) profile.address = address;
            if (userRole === "teacher") {
                  if (qualification) profile.qualification = qualification;
                  if (experience) profile.experience = experience;
            } else if (userRole === "student") {
                  if (fathersName) profile.fathersName = fathersName;
                  if (mothersName) profile.mothersName = mothersName;
                  if (dob) profile.dob = dob;
            }

            // Update Photo
            if (req.files?.photo) {
                  profile.photo = {
                        url: req.files.photo[0].path,
                        publicId: req.files.photo[0].filename,
                  };
            }

            // Handle Documents
            const docTypes = [
                  "Adhar Card",
                  "Pan Card",
                  "Marksheet",
                  "Father's Adhar Card",
            ];

            // Helper to add/update doc
            const updateDoc = (docName, fileKey) => {
                  if (req.files?.[fileKey]) {
                        const file = req.files[fileKey][0];
                        const existingIndex = profile.documents.findIndex(
                              (d) => d.name === docName
                        );

                        const newDoc = {
                              name: docName,
                              url: file.path,
                              publicId: file.filename,
                              status: "Pending", // Reset status on new upload
                        };

                        if (existingIndex >= 0) {
                              profile.documents[existingIndex] = newDoc;
                        } else {
                              profile.documents.push(newDoc);
                        }
                  }
            };

            updateDoc("Adhar Card", "adharCard");
            updateDoc("Pan Card", "panCard");
            updateDoc("Marksheet", "marksheet");
            updateDoc("Father's Adhar Card", "fatherAdharCard");

            // If any doc updated, set verification back to Pending?
            // Or only if crucial ones? Let's reset to Pending to be safe.
            profile.verificationStatus = "Pending";

            await profile.save();
            res.status(200).json({ message: "Profile updated successfully", profile });

      } catch (error) {
            console.error("Profile Upsert Error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get My Profile
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = async (req, res) => {
      try {
            const profile = await Profile.findOne({ userId: req.user._id });
            if (!profile) return res.status(404).json({ message: "Profile not found" });
            res.json(profile);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Specific User Profile (Admin)
// @route   GET /api/profile/user/:userId
// @access  Private/Admin
export const getUserProfile = async (req, res) => {
      try {
            const profile = await Profile.findOne({ userId: req.params.userId }).populate("userId", "name email role");
            // Return null or 404 is fine, frontend handles it
            if (!profile) return res.status(404).json({ message: "Profile not found" });
            res.json(profile);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get All Pending Profiles (Admin)
// @route   GET /api/profile/pending
// @access  Private/Admin
export const getPendingProfiles = async (req, res) => {
      try {
            const profiles = await Profile.find({
                  schoolId: req.user.schoolId,
                  // documents: { $elemMatch: { status: "Pending" } } // Fetch if ANY doc is pending?
                  // Or generic fetch all to show dashboard:
                  verificationStatus: { $ne: "Approved" } // Fetch anything not fully approved
            }).populate("userId", "name email role");

            res.json(profiles);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Verify Document / Profile (Admin)
// @route   PATCH /api/profile/verify/:id
// @access  Private/Admin
export const verifyProfile = async (req, res) => {
      try {
            const { docId, status, rejectionReason } = req.body;
            // If docId provided, verify specific doc.
            // If no docId, verify full profile? usually document-wise first.

            const profile = await Profile.findById(req.params.id);
            if (!profile) return res.status(404).json({ message: "Profile not found" });

            if (docId) {
                  const doc = profile.documents.id(docId);
                  if (!doc) return res.status(404).json({ message: "Document not found" });

                  doc.status = status; // Approved, Rejected
                  if (status === "Rejected") {
                        doc.rejectionReason = rejectionReason;
                  }
            } else {
                  // Overall Status Update
                  // Maybe logic to auto-update overall status if all docs approved?
                  // Or manual override?
            }

            // Auto-check overall status
            const allApproved = profile.documents.length > 0 && profile.documents.every(d => d.status === "Approved");
            const anyRejected = profile.documents.some(d => d.status === "Rejected");

            if (allApproved) {
                  profile.verificationStatus = "Approved";
                  profile.markModified("verificationStatus");
            }
            else if (anyRejected) {
                  profile.verificationStatus = "Rejected";
                  profile.markModified("verificationStatus");
            }
            else {
                  profile.verificationStatus = "Pending";
            }

            const savedProfile = await profile.save();
            res.json({ message: "Verification updated", profile: savedProfile });

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};
