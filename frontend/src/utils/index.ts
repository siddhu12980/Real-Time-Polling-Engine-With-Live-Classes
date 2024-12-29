import { jwtDecode, JwtPayload } from "jwt-decode";

// type JwtData struct {
// 	UserId   string `json:"userId"`
// 	Username string `json:"username"`
// 	Role     Role   `json:"role"`
// }

enum Role {
  Admin = "admin",
  User = "user",
}

interface JWT extends JwtPayload {
  userId: string;
  username: string;
  role: Role;
  expiresIn: number;
}

export function decodeToken(token: string): JWT | null {
  try {
    const decoded = jwtDecode<JWT>(token);

    console.log("Decoded token:", decoded);

    if (decoded.expiresIn && Date.now() >= decoded.expiresIn * 1000) {
      console.warn("Token has expired.");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
