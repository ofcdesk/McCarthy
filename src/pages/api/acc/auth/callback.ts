import { setACCTokenFromCallbackQuery } from "@/lib/tokenHelper";
import jsonwebtoken from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (
    req.query.tk === null ||
    req.query.tk === undefined ||
    req.query.ex === null ||
    req.query.ex === undefined ||
    req.query.rt === null ||
    req.query.rt === undefined
  ) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }
  if (!req.query.ex || !req.query.rt || !req.query.tk)
    return res.status(400).json({ error: "Missing data" });

  if (req.query.company_id) {
    await setACCTokenFromCallbackQuery(
      {
        ex: req.query.ex as string,
        rt: req.query.rt as string,
        tk: req.query.tk as string,
      },
      parseInt(req.query.company_id as string)
    );
  }

  const jwt = jsonwebtoken.sign(
    {
      tk: req.query.tk,
      ex: req.query.ex,
      rt: req.query.rt,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET! as string
  );

  if (!jwt || typeof jwt !== "string") {
    return res.status(500).json({ error: "Failed to create JWT" });
  }

  res.setHeader(
    "Set-Cookie",
    `acc_token=${jwt}; Secure; SameSite=None; Path=/; Max-Age=${parseInt(
      req.query.ex as string
    )}`
  );

  res.redirect("/");
}
