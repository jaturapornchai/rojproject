import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user?: DefaultSession["user"] & {
            username?: string;
            role?: "admin" | "user";
            isAdmin?: boolean;
            shopId?: string;
            allowed_reports?: string[];
        };
    }

    interface User {
        username?: string;
        role?: "admin" | "user";
        isAdmin?: boolean;
        shopId?: string;
        allowed_reports?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        username?: string;
        role?: "admin" | "user";
        isAdmin?: boolean;
        shopId?: string;
        allowed_reports?: string[];
    }
}
