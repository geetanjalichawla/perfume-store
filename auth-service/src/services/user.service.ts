// src/services/user.service.ts

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.config";
import { IGetAllUsersQueryInput } from "../types/user.type";
import { createUserSchema, getAllUsersQueryInputSchema, getUserByEmailSchema, getUserByIdSchema, getUserByUsernameSchema } from "../validation/user.schema";
import { emailSchema, usernameSchema } from "../validation/utills.schema";

export const getUserById = async (_id: number) => {
  const id = getUserByIdSchema.parse(_id);

  const user = await prisma.user.findUnique({
    where: { id},
  });

  return user;
};

export const getUserByUsername = async (_username: string) => {
  const username = getUserByUsernameSchema.parse(_username);
  const user = await prisma.user.findUnique({
    where: { username:username },
  });

  return user;
};

export const getUserByEmail = async (_email: string) => {
  const email = getUserByEmailSchema.parse(_email);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}

export const getAllUsers = async (query:IGetAllUsersQueryInput ) => {
  const {page, limit, search, sortBy, sortOrder, role} = getAllUsersQueryInputSchema.parse(query);

  let filter: Prisma.UserWhereInput = {};

  if(search) {
    filter = {
      OR: [
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  if(role) {
    filter = {
      ...filter,
      role
    }
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: 'desc'
  };
  if(sortBy && sortOrder) {
    orderBy = {
      [sortBy]: sortOrder
    }
  }

  const [users, total] =  await Promise.all([
    prisma.user.findMany({
      where: filter,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.user.count({
      where: filter
  })])

  return {
    data: users,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const isUserExists = async (_email?: string, _username?: string) => {
  const email = emailSchema.optional().parse(_email);
  const username = usernameSchema.optional().parse(_username);

  if(!email && !username) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: email,
        },
        {
          username: username,
        },
      ],
    },
  });
  return user;
};

export const createUser = async (_username: string, _email: string, _password: string) => {

  const {username , email, password} = createUserSchema.parse({
    username: _username,
    email: _email,
    password: _password
  })

  const isExist = await isUserExists(email, username);
  if (isExist) {
    throw new Error('User with this email or username already exists');
  }


  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: password,
    },
  });
  return user;
};



