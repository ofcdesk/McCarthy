// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getCronjobTime } from "@/lib/cronjobTimeHelper";
import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { validateCronTime, scheduleTask } = serverRuntimeConfig.CrontabService;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const time = await getCronjobTime();
  return res.send(time);
}
