import { z } from "zod";

export const emailSchema = z
  .string({
    invalid_type_error: "Email must be a string",
    required_error: "Email is required",
  })
  .email("Invalid email address");

export const usernameSchema = z
  .string({
    invalid_type_error: "Username must be a string",
    required_error: "Username is required",
  })
  .min(3, "Username must be at least 3 characters long");

export const passwordSchema = z
  .string({
    invalid_type_error: "Password must be a string",
    required_error: "Password is required ",
  })
  .min(6, "Password must be at least 6 characters long");

export const idSchema = z
  .number({
    invalid_type_error: "Id must be a number",
    required_error: "Id is required",
  })
  .min(1, "Id must be greater than or equal to 1");




