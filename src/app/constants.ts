
// export const baseUrl = 'https://myerp-production.up.railway.app';
export const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
export const wooClientKey = import.meta.env.VITE_WOO_CLIENT_KEY || 'ck_24045858e7e45e0635cdbf02c0b04dd67c82aea7';
export const wooClientSecret = import.meta.env.VITE_WOO_CLIENT_SECRET || 'cs_c9d4958db7c4160c0282c26a906b02ad670f4169';
