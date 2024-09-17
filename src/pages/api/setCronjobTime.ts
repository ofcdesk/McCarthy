// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { setCronjobTime } from "@/lib/cronjobTimeHelper";
import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { validateCronTime, scheduleTask } = serverRuntimeConfig.CrontabService;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const time = req.body.value;

  if (!time) {
    return res.status(400).json({ error: "No time provided" });
  }

  const isValid = validateCronTime(time);

  if (!isValid) {
    return res.status(400).json({ error: "Invalid cron time" });
  }

  scheduleTask(time);
  setCronjobTime(time);

  return res.json({ message: "Time updated!" });
}
