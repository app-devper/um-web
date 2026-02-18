export interface AppError {
  code: string;
  message: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  clientId: string;
  role: "SUPER" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  email: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  clientId: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface SetPasswordRequest {
  password: string;
}

export interface UpdateRoleRequest {
  role: "SUPER" | "ADMIN" | "USER";
}

export interface UpdateStatusRequest {
  status: "ACTIVE" | "INACTIVE";
}

export interface LoginRequest {
  username: string;
  password: string;
  system: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface System {
  id: string;
  clientId: string;
  systemName: string;
  systemCode: string;
  host: string;
}

export interface CreateSystemRequest {
  clientId: string;
  systemName: string;
  systemCode: string;
  host: string;
}

export interface UpdateSystemRequest {
  systemName: string;
  host: string;
}
