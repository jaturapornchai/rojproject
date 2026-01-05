export const SHOP_ID_SERVER = process.env.SHOP_ID ?? process.env.NEXT_PUBLIC_SHOP_ID ?? 'rungroj';
export const SHOP_ID_PUBLIC = process.env.NEXT_PUBLIC_SHOP_ID ?? 'rungroj';
export const ADMIN_USERNAMES = [
    'admin',
    'jaturapornchai',
    'gonut',
    'thep',
    'viroonc',
    'somkid',
    'roj2543',
    ...(process.env.ADMIN_USERNAMES ?? '').split(','),
]
    .map((username) => username.trim().toLowerCase())
    .filter(Boolean);
export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8108/v1';
export const BASE_PATH = '/rojproject';
export const USERS_JSON_PATH = process.env.USERS_JSON_PATH ?? (process.cwd() + '/users.json');

