import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/rojproject/login",
    },
});

export const config = {
    // ปกป้องความปลอดภัยทุกหน้า ยกเว้นหน้า login, register และ api data
    matcher: [
        "/((?!login|register|api/auth|api/public|_next/static|_next/image|favicon.ico).*)",
    ],
};
