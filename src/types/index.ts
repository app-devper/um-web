export interface AppError {
  code: string;
  message: string;
}

export type Role = "SUPER" | "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  clientId: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  email: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

/** What the signed-in Actor may do to one user, as UM decides it (um-api ADR-0006). */
export interface UserPermissions {
  edit: boolean;
  delete: boolean;
  setStatus: boolean;
  setRole: boolean;
  setPassword: boolean;
  unlock: boolean;
  assignableRoles: Role[];
}

/** A listed user with what the Actor may do to it. */
export type ManagedUser = User & { can?: UserPermissions };

/** What the Actor may do beyond individual users. */
export interface UserRules {
  creatableRoles: Role[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  clientId: string;
  role?: Role;
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
  role: Role;
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

export interface Session {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  userAgent: string;
  ipAddress: string;
  system: string;
  current: boolean;
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
