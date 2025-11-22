import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user?: DefaultSession["user"] & {
            role?: "admin" | "user";
            isAdmin?: boolean;
            shopId?: string;
        };
    }

    interface User {
        role?: "admin" | "user";
        isAdmin?: boolean;
        shopId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: "admin" | "user";
        isAdmin?: boolean;
        shopId?: string;
    }
}
