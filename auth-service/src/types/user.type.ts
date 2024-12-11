export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}
export enum sortBy {
    createdAt = 'createdAt',
    username = 'username',
    email = 'email',
}

export enum sortOrder {
    asc = 'asc',
    desc = 'desc',
}
export type IGetAllUsersQueryInput = {
    limit?: number;
    page?: number;
    search?: string;
    sortBy?: sortBy;
    sortOrder?: sortOrder;
    role?: UserRole
};