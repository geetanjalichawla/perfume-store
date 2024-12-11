import { StatusCodes } from "http-status-codes";

class CustomError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        
        // Set the prototype explicitly for custom error classes in TypeScript
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export default CustomError;
