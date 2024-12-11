// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import CustomError from "../utils/custom-error.utils";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../utils/catch-async.utils";

// Get User by ID
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = await userService.getUserById(Number(id));

  if (!user) {
    throw new CustomError("User not found", StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({ user });
};

// Get User by Username
const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;
  const user = await userService.getUserByUsername(username);

  if (!user) {
    throw new CustomError("User not found", StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({ user });
};

// Get User by Email
const getUserByEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    throw new CustomError("Email query parameter is required", StatusCodes.BAD_REQUEST);
  }
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new CustomError("User not found", StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({ user });
};

// Get All Users with Pagination, Sorting, and Filtering
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const data = await userService.getAllUsers(req.query);

  res.status(StatusCodes.OK).json({
    message: "Users retrieved successfully",
    ...data,
  });
};

// Create New User
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await userService.isUserExists(email, username);
  if (existingUser) {
    throw new CustomError("User with this email or username already exists", StatusCodes.CONFLICT);
  }

  // Create new user
  const user = await userService.createUser(username, email, password);


  if(!user) {
    throw new CustomError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR);
  }

  res.status(StatusCodes.CREATED).json({
    message: "User created successfully",
    user,
  });
};

// Export the controller functions
const userController = {
  getUserById: catchAsync(getUserById),
  getUserByUsername: catchAsync(getUserByUsername),
  getUserByEmail: catchAsync(getUserByEmail),
  getAllUsers: catchAsync(getAllUsers),
  createUser: catchAsync(createUser),
};

export default userController;
