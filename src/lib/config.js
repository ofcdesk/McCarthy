export const ironOptions = {
  cookieName: process.env.COOKIES_NAME,
  password: process.env.COOKIES_PASSWORD,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
