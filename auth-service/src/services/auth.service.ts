import { prisma } from '../config/db.config';
import bcrypt from 'bcrypt';
import { produceMessage } from './kafkaProducer.service';
import { registerUserSchema, loginUserSchema } from '../validation/auth.schema';
import CustomError from '../utils/custom-error.utils';
import { StatusCodes } from 'http-status-codes';
import { generateRefreshToken, signToken, verifyRefreshToken } from '../config/jwt.config';
import { createUser, getUserByEmail, isUserExists } from './user.service';

    /**
     * Registers a new user with the given username, email, and password.
     * If a user with the same email or username already exists, a conflict error is thrown.
     * After registration, a message is sent to the "user-registration-topic" Kafka topic with the new user's ID and username.
     * @param {string} username - The username of the new user
     * @param {string} email - The email address of the new user
     * @param {string} password - The password of the new user
     * @returns {Promise<{user: User}>} - The newly created user
     * @throws {CustomError} - If the user already exists or if there is an error creating the user
     */
export const registerUser = async (username: string, email: string, password: string) => {
    const parsedInput = registerUserSchema.parse({ username, email, password });

    const user = await isUserExists(email, username);
    if (user) {
        throw new CustomError('User already exists', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(parsedInput.password, 10);
    const newUser = await createUser(username, email, hashedPassword);
    
    if (!newUser) {
        throw new CustomError('Failed to create user', StatusCodes.NOT_FOUND);
    }
    // After registration, send message for any post-registration actions
    await produceMessage('user-registration-topic', { userId: newUser.id, username: newUser.username });

    return {user: newUser};
};

    /**
     * Authenticates a user using their email and password.
     * If the authentication is successful, a message is sent to the "user-login-topic" Kafka topic.
     * @param {string} email - The email address of the user to authenticate
     * @param {string} password - The password of the user to authenticate
     * @returns {Promise<{user: User}>} - The authenticated user
     * @throws {CustomError} - If the email or password is invalid
     */
export const loginUser = async (email: string, password: string) => {
    const parsedInput = loginUserSchema.parse({ email, password });
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(parsedInput.password, user.password))) {
        throw new CustomError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    // Track login activity and status, then return user data
    await produceMessage('user-login-topic', { userId: user.id, username: user.username });

    return { user };
};

/**
 * Generates an access token and a refresh token for the given user ID, IP address, and device information.
 * The access token is signed with the secret key defined in the JWT_SECRET environment variable, and is set to
 * expire after a duration defined in the JWT_EXPIRATION environment variable.
 * The refresh token is saved in the database with an expiration time of 7 days.
 * @param {number} userId - The user ID to encode in the token
 * @param {string} ip - The IP address associated with the user
 * @param {string} device - The device information associated with the user
 * @returns {Promise<{token: string, refreshToken: string}>} - The generated access token and refresh token
 */
export const generateTokens = async (userId: number , ip: string, device: string) => {
    const token = signToken(userId, ip, device);
    const refreshToken = generateRefreshToken(userId,ip, device);

    // Save tokens in the database with expiration time
    await prisma.token.create({
        data: {
            userId,
            token: refreshToken,
            ipAddress : ip,
            deviceInfo : device,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // e.g., 7 days
        },
    });

    return {
        token,
        refreshToken,
    };
};

/**
 * @description
 * Refreshes the user's authentication tokens using the provided refresh token.
 * The refresh token must be valid and not expired. The user's IP address and
 * device information are also validated.
 *
 * @param {string} refreshToken - The refresh token to use for authentication.
 * @param {string} ip - The user's IP address to validate.
 * @param {string} device - The user's device information to validate.
 *
 * @throws {CustomError} - If the refresh token is invalid, expired, or the
 *   user's IP address or device information do not match.
 *
 * @returns {Promise<{ token: string, refreshToken: string }>} - A promise with
 *   the new authentication tokens.
 */
export const refreshToken = async (refreshToken: string, ip: string, device: string) => {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded?.userId) {
        throw new CustomError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
    });
    if (!user) {
        throw new CustomError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
    }

    // Find the refresh token in the database and validate expiration
    const storedToken = await prisma.token.findFirst({
        where: { userId: user.id, token: refreshToken },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new CustomError('Refresh token expired', StatusCodes.UNAUTHORIZED);
    }

    const newToken = signToken(user.id,ip,device);
    const newRefreshToken = generateRefreshToken(user.id,ip,device);

    // Update refresh token in the database
    await prisma.token.update({
        where: { id: storedToken.id },
        data: {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    return {
        token: newToken,
        refreshToken: newRefreshToken,
    };
};

