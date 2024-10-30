export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}
export enum sortBy {
    createdAt = 'createdAt',
    username = 'username',
    email = 'email',
}

export type IGetAllUsersQueryInput = {
    limit?: number;
    page?: number;
    search?: string;
    sortBy?: sortBy;
    sortOrder?: string;
    role?: UserRole
};