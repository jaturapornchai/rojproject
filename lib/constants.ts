export const SHOP_ID_SERVER = process.env.SHOP_ID ?? process.env.NEXT_PUBLIC_SHOP_ID ?? 'rungroj';
export const SHOP_ID_PUBLIC = process.env.NEXT_PUBLIC_SHOP_ID ?? 'rungroj';
export const DEFAULT_ADMIN_EMAILS = [
    'jaturapornchai@gmail.com',
    'gonut.thep@gmail.com',
    'viroonc@gmail.com',
    'somkid@smlsoft.com',
    'roj2543@gmail.com',
    ...(process.env.DEFAULT_ADMIN_EMAILS ?? '').split(','),
]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8108/v1';
