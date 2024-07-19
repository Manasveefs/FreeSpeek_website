// src/middleware/validators.js
import { check, validationResult } from "express-validator";

export const registerValidation = [
  check("email", "Email is required").isEmail(),
  check(
    "password",
    "Password must be at least 6 characters long and contain at least one alphabet character"
  ).matches(/^(?=.*[A-Za-z]).{6,}$/),
];

export const loginValidation = [
  check("email", "Email is required").isEmail(),
  check("password", "Password is required").exists(),
];

export const updateUserValidation = [
  check("phoneNumber").optional().isMobilePhone(),
  check("firstName").optional().isString(),
  check("lastName").optional().isString(),
  check("preferredName").optional().isString(),
  check("gender").optional().isIn(["male", "female", "non-binary"]),
  check("preferredGender").optional().isIn(["male", "female", "non-binary"]),
  check("dateOfBirth").optional().isISO8601(),
  check("homeLocation").optional().isString(),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
