import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
      try {
            let token;

            if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
                  token = req.headers.authorization.split(" ")[1];
            }

            if (!token) {
                  return res.status(401).json({ message: "Not authorized, no token" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
            req.user = await User.findById(decoded.id).select("-password").populate('classId');

            if (!req.user) {
                  return res.status(401).json({ message: "User not found" });
            }

            next();
      } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
      }
};

export const authorize = (...roles) => {
      return (req, res, next) => {
            const roleHierarchy = {
                  student: 1,
                  teacher: 2,
                  admin: 3,
                  superadmin: 4
            };

            const userRoleValue = roleHierarchy[req.user.role];

            // Check if user has sufficient role level for any of the required roles
            // We assume the route requires AT LEAST the lowest role in the 'roles' array
            // Or we check if user role exactly matches one of the allowed roles
            // But for hierarchy, usually we want: if I need 'teacher' access, 'admin' should work.

            // Let's stick to explicit inclusion for now, but expand the check to be smarter if needed.
            // Actually, simpler: define which roles imply which others.

            // Better approach: If I ask for 'teacher', 'admin' and 'superadmin' are also good.

            const allowedRoles = new Set();
            roles.forEach(role => {
                  allowedRoles.add(role);
                  if (role === 'student') {
                        allowedRoles.add('teacher');
                        allowedRoles.add('admin');
                        allowedRoles.add('superadmin');
                  }
                  if (role === 'teacher') {
                        allowedRoles.add('admin');
                        allowedRoles.add('superadmin');
                  }
                  if (role === 'admin') {
                        allowedRoles.add('superadmin');
                  }
            });

            if (!allowedRoles.has(req.user.role)) {
                  return res.status(403).json({
                        message: `User role '${req.user.role}' is not authorized to access this route`
                  });
            }
            next();
      };
};
