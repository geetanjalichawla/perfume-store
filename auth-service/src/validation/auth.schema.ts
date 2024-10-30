// src/validation/authSchemas.ts
import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "./utills.schema";



export const registerUserSchema = z.object({
  username:usernameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});
