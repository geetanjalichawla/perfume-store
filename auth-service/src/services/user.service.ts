// src/services/user.service.ts

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.config";
import { IGetAllUsersQueryInput } from "../types/user.type";
import { getAllUsersQueryInputSchema } from "../validation/user.schema";

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  return user;
};

export const getUserByEmail = async (email: string) => {
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

  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: filter,
    orderBy:orderBy,
  });
  return users;
};

export const createUser = async (username: string, email: string, password: string) => {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: password,
    },
  });
  return user;
};

export const isUserExists = async (email: string, username: string) => {
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

