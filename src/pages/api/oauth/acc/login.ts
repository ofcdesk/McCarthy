// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { redirect } from "next/dist/server/api-utils";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }

  let returnUrl = req.headers.host;

  if (!returnUrl) {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }

  if (!returnUrl.includes("http")) {
    if (
      process.env.NODE_ENV === "test" ||
      process.env.NODE_ENV === "development"
    ) {
      returnUrl = "http://" + returnUrl;
    } else {
      returnUrl = "https://" + returnUrl;
    }
  }

  if (!req.query.company_id) {
    redirect(
      res,
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
        "/api/acc/auth/login?application_token=" +
        process.env.PUBLIC_SIHUB_APPLICATION_TOKEN +
        "&return_url=" +
        encodeURIComponent(returnUrl + "/api/acc/auth/callback")
    );
    return;
  }

  redirect(
    res,
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/acc/auth/login?application_token=" +
      process.env.PUBLIC_SIHUB_APPLICATION_TOKEN +
      "&return_url=" +
      encodeURIComponent(
        returnUrl + "/api/acc/auth/callback?company_id=" + req.query.company_id
      )
  );
}
