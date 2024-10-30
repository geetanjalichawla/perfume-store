import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/custom-error.utils";
import { StatusCodes } from "http-status-codes";
import { generateTokens, registerUser, loginUser, refreshToken as refreshAuthToken } from "../services/auth.service";
import { catchAsync } from "../utils/catch-async.utils";

const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new CustomError('Missing required fields', StatusCodes.BAD_REQUEST);
    }

    const ip = req.ip || 'Unknown IP';
    const device = req.headers['user-agent'] || 'Unknown Device';
    
    const user = await registerUser(username, email, password);
    const tokens = await generateTokens(user.user.id, ip, device);

    res.status(StatusCodes.CREATED).json({
        message: 'User registered successfully',
        user: user.user,
        tokens,
    });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError('Email and password are required', StatusCodes.BAD_REQUEST);
    }

    const user = await loginUser(email, password);
    const ip = req.ip || 'Unknown IP';
    const device = req.headers['user-agent'] || 'Unknown Device';
    const tokens = await generateTokens(user.user.id, ip, device);

    res.status(StatusCodes.OK).json({
        message: 'User logged in successfully',
        user: user.user,
        tokens,
    });
};

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const ip = req.ip || 'Unknown IP';
    const device = req.headers['user-agent'] || 'Unknown Device';

    if (!refreshToken) {
        throw new CustomError('Refresh token is required', StatusCodes.BAD_REQUEST);
    }

    const tokens = await refreshAuthToken(refreshToken, ip, device);

    res.status(StatusCodes.OK).json({
        message: 'Token refreshed successfully',
        tokens,
    });
};

const authController = {
    register: catchAsync(register),
    login: catchAsync(login),
    refreshToken: catchAsync(refreshToken),
};

export default authController;
