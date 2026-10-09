export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    address?: string;
    phoneNumber?: string;
    initials?: string;
}

export interface UserResponse {
    status: string;
    data: User;
}
