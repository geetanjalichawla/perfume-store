import { prisma } from "../../config/db.config";
import {
  IGetAllUsersQueryInput,
  sortBy,
  sortOrder,
  UserRole,
} from "../../types/user.type";
import * as userService from "../user.service";

jest.mock("../../config/db.config");

describe("User Service", () => {
  const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return a user if found by ID", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser); // Mock the function

      const user = await userService.getUserById(1);

      expect(user).toEqual(mockUser);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null if no user is found", async () => {
      (prisma.user.findUnique as jest.Mock).mockClear();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await userService.getUserById(999);

      expect(user).toBeNull();
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it("should throw a Zod error if the user ID is invalid", async () => {
      const invalidId = "fdsf" as any; // Invalid ID

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Id must be a number"),
        })
      );
    });

    it("should throw a Zod error if the user ID is zero", async () => {
      const invalidId = 0; // Edge case: Zero ID

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            "Id must be greater than or equal to 1"
          ),
        })
      );
    });

    it("should throw a Zod error if the user ID is negative", async () => {
      const invalidId = -1; // Edge case: Negative ID

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            "Id must be greater than or equal to 1"
          ),
        })
      );
    });

    it("should throw a Zod error if the user ID is null", async () => {
      const invalidId = null as any; // Edge case: Null ID

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Id must be a number"),
        })
      );
    });

    it("should throw a Zod error if the user ID is undefined", async () => {
      const invalidId = undefined as any; // Edge case: Undefined ID

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Id is required"),
        })
      );
    });
  });

  describe("getUserByUsername", () => {
    it("should return a user if found by username", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      const user = await userService.getUserByUsername("testuser");

      expect(user).toEqual(mockUser);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
    });

    it("should return null if no user is found by username", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await userService.getUserByUsername("nonexistentuser");

      expect(user).toBeNull();
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: "nonexistentuser" },
      });
    });

    it("should throw a Zod error for non-string username", async () => {
      const invalidUsername = 12345 as any; // Invalid input type

      await expect(
        userService.getUserByUsername(invalidUsername)
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Username must be a string"),
        })
      );
    });

    it("should throw a Zod error for null username", async () => {
      const invalidUsername = null as any;

      await expect(
        userService.getUserByUsername(invalidUsername)
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Username must be a string"),
        })
      );
    });

    it("should throw a Zod error for undefined username", async () => {
      const invalidUsername = undefined as any; // Undefined input

      await expect(
        userService.getUserByUsername(invalidUsername)
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Username is required"),
        })
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user if found by email", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser as any);

      const user = await userService.getUserByEmail("test@example.com");

      expect(user).toEqual(mockUser);
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if no user is found by email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const user = await userService.getUserByEmail("nonexistent@example.com");

      expect(user).toBeNull();
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
    });

    it("should throw a Zod error for non-string email", async () => {
      const invalidEmail = 12345 as any; // Invalid input type

      await expect(userService.getUserByEmail(invalidEmail)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Email must be a string"),
        })
      );
    });

    it("should throw a Zod error for null email", async () => {
      const invalidEmail = null as any; // Null input

      await expect(userService.getUserByEmail(invalidEmail)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Email must be a string"),
        })
      );
    });

    it("should throw a Zod error for undefined email", async () => {
      const invalidEmail = undefined as any; // Undefined input

      await expect(userService.getUserByEmail(invalidEmail)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Email is required"),
        })
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return paginated and filtered users with total count", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers as any);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const query = { page: 1, limit: 10, search: "user" };
      const result = await userService.getAllUsers(query);

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: { contains: "user", mode: "insensitive" } },
            { email: { contains: "user", mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("should return an empty array and zero total if no users match the search", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      const query = { page: 1, limit: 10, search: "nonexistent" };
      const result = await userService.getAllUsers(query);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0); // Adjusted for total pages calculation
    });

    it("should handle pagination correctly", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
        { id: 3, username: "user3" },
        { id: 4, username: "user4" },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(
        mockUsers.slice(0, 2) as any
      );
      (prisma.user.count as jest.Mock).mockResolvedValue(4);

      const query = { page: 1, limit: 2, search: "user" };
      const result = await userService.getAllUsers(query);

      expect(result.data).toEqual(mockUsers.slice(0, 2));
      expect(result.total).toBe(4);
      expect(result.totalPages).toBe(2); // Adjusted for total pages calculation
    });

    it("should throw a Zod error for invalid pagination input", async () => {
      const invalidQuery = { page: "string", limit: -5, search: 12345 } as any; // Invalid inputs

      await expect(userService.getAllUsers(invalidQuery)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Page must be a number"),
        })
      );

      await expect(userService.getAllUsers(invalidQuery)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(
            "Limit must be greater than or equal to 1"
          ),
        })
      );

      await expect(userService.getAllUsers(invalidQuery)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Search must be a string"),
        })
      );
    });

    it("should throw a Zod error for negative or zero pages", async () => {
      const invalidQueries = [
        { page: 0, limit: 10, search: "user" },
        { page: -1, limit: 10, search: "user" },
      ];

      for (const query of invalidQueries) {
        await expect(userService.getAllUsers(query)).rejects.toThrow(
          expect.objectContaining({
            message: expect.stringContaining(
              "Page must be greater than or equal to 1"
            ),
          })
        );
      }
    });

    it("should handle sortBy and sortOrder options", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers as any);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const query: IGetAllUsersQueryInput = {
        page: 1,
        limit: 10,
        search: "user",
        sortBy: sortBy.username,
        sortOrder: sortOrder.asc,
      };
      const result = await userService.getAllUsers(query);

      expect(result.data).toEqual(mockUsers);
      expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: { contains: "user", mode: "insensitive" } },
            { email: { contains: "user", mode: "insensitive" } },
          ],
        },
        orderBy: { username: "asc" },
        take: 10,
        skip: 0,
      });
    });

    it("should handle roles options", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers as any);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const query: IGetAllUsersQueryInput = {
        page: 1,
        limit: 10,
        role: UserRole.USER,
      };
      const result = await userService.getAllUsers(query);

      expect(result.data).toEqual(mockUsers);
      expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: UserRole.USER,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("createUser", () => {
    it("should create and return a new user", async () => {
      const newUser = {
        id: 1,
        username: "newuser",
        email: "new@example.com",
        password: "hashedpassword",
      };
      (mockedPrisma.user.create as jest.Mock).mockResolvedValue(newUser as any);

      const createdUser = await userService.createUser(
        "newuser",
        "new@example.com",
        "hashedpassword"
      );

      expect(createdUser).toEqual(newUser);
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          username: "newuser",
          email: "new@example.com",
          password: "hashedpassword",
        },
      });
    });

    it("should throw an error if the user is already in use", async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        username: "existinguser",
        email: "existing@example.com",
      });

      await expect(
        userService.createUser(
          "existinguser",
          "existing@example.com",
          "hashedpassword"
        )
      ).rejects.toThrow("User with this email or username already exists");

      expect(mockedPrisma.user.findFirst).toHaveBeenCalled();
    });
  });

  describe("isUserExists", () => {
    it("should return a user if one exists with the given email or username", async () => {
      const existingUser = {
        id: 1,
        username: "existinguser",
        email: "existing@example.com",
      };
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue(
        existingUser as any
      );

      const user = await userService.isUserExists(
        "existing@example.com",
        "existinguser"
      );

      expect(user).toEqual(existingUser);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: "existing@example.com" }, { username: "existinguser" }],
        },
      });
    });

    it("should return null if no user exists with the given email or username", async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const user = await userService.isUserExists(
        "nonexistent@example.com",
        "nonexistent"
      );

      expect(user).toBeNull();
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: "nonexistent@example.com" },
            { username: "nonexistent" },
          ],
        },
      });
    });

    it("should handle database errors", async () => {
      (mockedPrisma.user.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        userService.isUserExists("error@example.com", "erroruser")
      ).rejects.toThrow("Database error");

      expect(mockedPrisma.user.findFirst).toHaveBeenCalled();
    });
    it("should handle no queries", async () => {
      const user = await userService.isUserExists();
      expect(user).toBeNull();
    });
  });
});
