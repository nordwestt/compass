export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
  isServerResource?: boolean;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isAdmin?: boolean;
  isActive?: boolean;
} 