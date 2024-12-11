import { z } from "zod";
import { emailSchema, idSchema, passwordSchema, usernameSchema } from "./utills.schema";

export const roleSchema = z.enum(["ADMIN", "USER"], {invalid_type_error: "Role must be a string", message: "Role must be one of: admin, user"}).optional();


export const getAllUsersQueryInputSchema = z.object({
  page: z.number({ invalid_type_error: "Page must be a number" }).min(1, { message: "Page must be greater than or equal to 1" }).default(1),
  limit: z.number({ invalid_type_error: "Limit must be a number" }).min(1, { message: "Limit must be greater than or equal to 1" }).max(100, { message: "Limit must be less than or equal to 100" }).default(10),
  search: z.string({invalid_type_error: "Search must be a string"}).optional(),
  sortBy: z.enum(["createdAt", "username", "email"], {invalid_type_error: "SortBy must be a string", message: "SortBy must be one of: createdAt, username, email"}).optional(),
  sortOrder: z.enum(["asc", "desc"], {invalid_type_error: "SortOrder must be a string", message: "SortOrder must be one of: asc, desc"}).optional(),
  role: roleSchema
});


export const getUserByIdSchema = idSchema;

export const getUserByUsernameSchema = usernameSchema;

export const getUserByEmailSchema = emailSchema;

export const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});


