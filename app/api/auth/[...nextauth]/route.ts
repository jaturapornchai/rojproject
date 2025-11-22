import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BACKEND_URL, DEFAULT_ADMIN_EMAILS, SHOP_ID_SERVER } from "@/lib/constants";

interface AccessRecord {
    email: string;
    role?: string;
    is_admin?: boolean;
    is_active?: boolean;
    shopid?: string;
    allowed_reports?: string[];
    created_at?: string;
    updated_at?: string;
}

async function fetchAccessRecord(email: string): Promise<AccessRecord | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/mongoatlasget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                collection: "user_access",
                filter: { shopid: SHOP_ID_SERVER, email },
                limit: 1,
            }),
            cache: "no-store",
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Access control fetch failed", data);
            return null;
        }

        if (Array.isArray(data.data) && data.data.length > 0) {
            return data.data[0] as AccessRecord;
        }

        return null;
    } catch (error) {
        console.error("Access control fetch error", error);
        return null;
    }
}

async function upsertAccessRecord(email: string, role: "admin" | "user"): Promise<AccessRecord | null> {
    try {
        const timestamp = new Date().toISOString();
        const payload = {
            collection: "user_access",
            filter: { shopid: SHOP_ID_SERVER, email },
            data: {
                shopid: SHOP_ID_SERVER,
                email,
                role,
                is_admin: role === "admin",
                is_active: true,
                created_at: timestamp,
                updated_at: timestamp,
            },
            upsert: true,
        };

        const response = await fetch(`${BACKEND_URL}/mongoatlasupdate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            console.error("Access control upsert failed", data);
            return null;
        }

        return fetchAccessRecord(email);
    } catch (error) {
        console.error("Access control upsert error", error);
        return null;
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user }) {
            const email = user.email?.toLowerCase();
            if (!email) {
                return false;
            }

            // Check if user is a hardcoded admin
            if (DEFAULT_ADMIN_EMAILS.includes(email)) {
                (user as any).role = "admin";
                (user as any).isAdmin = true;
                (user as any).shopId = SHOP_ID_SERVER;
                (user as any).allowed_reports = []; // Admins have access to everything
                return true;
            }

            let record = await fetchAccessRecord(email);

            if (!record) {
                return false;
            }

            const isActive = record.is_active ?? true;
            if (!isActive) {
                return false;
            }

            const role = (record.role ?? (record.is_admin ? "admin" : "user")) as "admin" | "user";
            (user as any).role = role;
            (user as any).isAdmin = role === "admin";
            (user as any).shopId = SHOP_ID_SERVER;
            (user as any).allowed_reports = record.allowed_reports || [];

            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                const role = (token.role as "admin" | "user" | undefined) ?? "user";
                session.user.role = role;
                session.user.isAdmin = role === "admin";
                session.user.shopId = token.shopId as string | undefined;
                (session.user as any).allowed_reports = (token.allowed_reports as string[] | undefined) || [];
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                const role = ((user as any).role as "admin" | "user" | undefined) ?? (token.role as "admin" | "user" | undefined) ?? "user";
                token.role = role;
                token.isAdmin = role === "admin";
                token.shopId = (user as any).shopId ?? token.shopId ?? SHOP_ID_SERVER;
                token.allowed_reports = (user as any).allowed_reports || [];
            }
            return token;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
});

export { handler as GET, handler as POST };
