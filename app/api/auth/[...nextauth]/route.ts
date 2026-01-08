import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SHOP_ID_SERVER } from "@/lib/constants";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8108/v1";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
                }

                try {
                    const response = await fetch(`${BACKEND_URL}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: credentials.username,
                            password: credentials.password
                        })
                    });

                    const result = await response.json();

                    if (!response.ok || result.status !== "success") {
                        throw new Error(result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                    }

                    const user = result.user;
                    let allowedReports: string[] = [];
                    try {
                        if (typeof user.allowed_reports === "string") {
                            allowedReports = JSON.parse(user.allowed_reports || "[]");
                        } else if (Array.isArray(user.allowed_reports)) {
                            allowedReports = user.allowed_reports;
                        }
                    } catch (e) {
                        console.error("Error parsing allowed_reports:", e);
                    }

                    // Return user object without sensitive information
                    return {
                        id: user.username,
                        name: user.username,
                        username: user.username,
                        role: user.role,
                        isAdmin: user.isAdmin,
                        shopId: user.shopId || SHOP_ID_SERVER,
                        allowed_reports: allowedReports,
                    };
                } catch (error: any) {
                    console.error("Authentication error:", error);
                    throw new Error(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
                }
            }
        }),
    ],
    pages: {
        signIn: "/rojproject/login",
        error: "/rojproject/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
                token.role = user.role || "user";
                token.isAdmin = user.isAdmin || false;
                token.shopId = user.shopId || SHOP_ID_SERVER;
                token.allowed_reports = user.allowed_reports || [];
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.username = token.username;
                session.user.role = (token.role as "admin" | "user") || "user";
                session.user.isAdmin = (token.isAdmin as boolean) || false;
                session.user.shopId = (token.shopId as string) || SHOP_ID_SERVER;
                session.user.allowed_reports = (token.allowed_reports as string[]) || [];
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // allows relative paths
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // allows same-origin absolute paths
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
