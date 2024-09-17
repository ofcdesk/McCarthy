// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieToken = req.cookies.procore_token;
  if (!cookieToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = jwt.verify(cookieToken, process.env.JWT_SECRET!);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const selectedProjectId = req.query.project_id;

  if (!selectedProjectId) {
    return res.status(400).json({ error: "No project_id provided" });
  }

  const submittalId = req.query.submittal_id;

  if (!submittalId) {
    return res.status(400).json({ error: "No submittal_id provided" });
  }

  const companyId = req.query.company_id;

  if (!companyId) {
    return res.status(400).json({ error: "No company_id provided" });
  }

  // use getSubmittal function
  getSubmittal(
    selectedProjectId as string,
    submittalId as string,
    companyId as string,
    // @ts-ignore
    token.access_token
  )
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}

export function getSubmittal(
  project_id: string,
  submittal_id: string,
  company_id: string,
  token: string
) {
  //console.log(project_id, submittal_id, company_id, token);
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-submittal?project_id=" +
      project_id +
      "&submittal_id=" +
      submittal_id +
      "&company_id=" +
      company_id +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch Submittal");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}

export function getRFIReply(
  project_id: string,
  rfi_id: string,
  company_id: string,
  reply_id: string,
  token: string
) {
  //console.log(project_id, submittal_id, company_id, token);

  console.log(project_id, rfi_id, company_id, reply_id, token);

  console.log(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-rfi-reply?project_id=" +
      project_id +
      "&rfi_id=" +
      rfi_id +
      "&reply_id=" +
      reply_id +
      "&company_id=" +
      company_id +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN
  );
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-rfi-reply?project_id=" +
      project_id +
      "&rfi_id=" +
      rfi_id +
      "&reply_id=" +
      reply_id +
      "&company_id=" +
      company_id +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch RFI Reply");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}
