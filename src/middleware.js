// middleware.js

import { NextResponse } from "next/server";
import { getIronSession } from "iron-session/edge";
import { ironOptions } from "lib/config";

export const middleware = async (req) => {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, ironOptions);

  // do anything with session here:
  const { user } = session;

  if (user !== undefined && req.url.includes("login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (user === undefined && !req.url.includes("login")) {
    return NextResponse.redirect(new URL("/login", req.url)); // redirect to /unauthorized page
  }

  res.headers.append(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_API_URL_DOMAIN
  );

  return res;
};

// See "Matching Paths" below to learn more
export const config = {
  matcher:
    "/((?!api/*|_next/static|_next/image|favicon.ico|assets|anonymous-issue).*)",
};
