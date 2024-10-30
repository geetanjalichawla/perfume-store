// src/config/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRATION = '1h'; 
const JWT_REFRESH_EXPIRATION = '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

// decoded user type 
type DecodedUser = {
    userId: number;
  };


/**
 * Generates a JSON web token from a given user ID. The token is signed with the
 * secret key defined in the JWT_SECRET environment variable, and is set to
 * expire after a duration defined in the JWT_EXPIRATION environment variable.
 *
 * @param {number} userId - The user ID to encode in the token
 * @returns {string} The generated JSON web token
 */
export const signToken = (userId: number, ip: string, device: string) => {
  const token = jwt.sign({ userId , ip, device}, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  return token;
};


/**
 * Generates a JSON web token from a given user ID, for use as a refresh token.
 * The token is signed with the secret key defined in the JWT_REFRESH_SECRET
 * environment variable, and is set to expire after a duration defined in the
 * JWT_REFRESH_EXPIRATION environment variable.
 *
 * @param {number} userId - The user ID to encode in the token
 * @returns {string} The generated JSON web token
 */

export const generateRefreshToken = (userId: number, ip: string, device: string): string => {
    const token = jwt.sign({ userId, ip, device } as DecodedUser, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
    return token;
}

/**
 * Verifies a given JSON web token, returning the decoded payload if
 * verification is successful, or null if verification fails.
 *
 * @param {string} token - The JSON web token to verify
 * @returns {object|null} The decoded payload if verification is successful, or
 * null if verification fails.
 */
export const verifyToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded as DecodedUser; 
    } catch (error) {
      return null; 
    }
  };
  
export const verifyRefreshToken = (token: string) => {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      return decoded as DecodedUser; 
    } catch (error) {
      return null; 
    }
  };