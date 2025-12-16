import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
      createFeeStructure,
      getFeeStructures,
      recordPayment,
      getStudentFeeStatus,
      getClassFeeStatus,
      createPaymentOrder,
      updateFeeStructure,
      deleteFeeStructure
} from "../controllers/feeController.js";

const router = express.Router();

router.use(protect);

router.route("/structure")
      .post(authorize("admin", "superadmin"), createFeeStructure)
      .get(getFeeStructures);

router.route("/structure/:id")
      .put(authorize("admin", "superadmin"), updateFeeStructure)
      .delete(authorize("admin", "superadmin"), deleteFeeStructure);

router.route("/pay")
      .post(recordPayment); // Removed admin check to allow students to record successful payment

router.route("/order")
      .post(createPaymentOrder);

router.route("/status/:studentId")
      .get(getStudentFeeStatus);

router.route("/class/:classId")
      .get(authorize("admin", "superadmin", "teacher"), getClassFeeStatus);

export default router;
