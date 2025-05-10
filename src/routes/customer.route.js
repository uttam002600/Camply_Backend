import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.route("/create").post(createCustomer);
router.route("/").get(getCustomers);
router.route("/:id").get(getCustomer);
router.route("/:id").put(updateCustomer);
router.route("/:id").delete(deleteCustomer);

export default router;
