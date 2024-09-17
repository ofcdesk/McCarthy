// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookie from "cookie";
import { verify } from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
const { serverRuntimeConfig } = getConfig();
const { ftpClient } = serverRuntimeConfig.CrontabService;

import axios from "axios";
import fs from "fs";

import type { Client } from "basic-ftp";
import getConfig from "next/config";

async function downloadFile(client: Client, fileName: string) {
  await client.downloadTo("files/" + fileName, fileName);
}

async function uploadFile(
  fileName: string,
  projectId: string,
  folderId: string,
  token: string
) {
  const formData = new FormData();

  formData.append(
    "data",
    JSON.stringify({
      relationship: {
        type: "file",
        folderId: folderId,
        fileName,
      },
    })
  );

  const attachment = fs.readFileSync("files/" + fileName);

  const fileBlob = new Blob([attachment]);
  formData.append(fileName, fileBlob, fileName);

  axios(
    "http://localhost:3001" +
      "/api/acc/v2/upload-document-file/" +
      projectId +
      "?application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN!,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    }
  ).catch(() => null);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const JWTToken = cookies["acc_token"];

  if (!JWTToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  interface DecodedToken {
    tk: string;
    [key: string]: any;
  }

  const token = verify(
    JWTToken,
    process.env.JWT_SECRET! as string
  ) as DecodedToken;

  const projects = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
      "/api/acc/v2/projects?application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN!,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // @ts-ignore
        Authorization: token.tk,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });

  const project = projects.find(
    (p: { attributes: { name: string } }) =>
      p.attributes.name == "Ofcdesk-Development"
  );

  const projectId = project.id;
  // FIXME: Hard coded
  const folderId = "urn:adsk.wipprod:fs.folder:co.9Sh-Doi6SWCgaRD9JRO7mA";

  try {
    await ftpClient.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: "implicit",
      port: process.env.FTP_PORT,
    });

    // FIXME: Hard coded
    await ftpClient.cd(
      "21075 Project M/_ISSUED PACKAGES & PRESENTATIONS/ROD - Rotunda Demo/2024-07-24 Permit Issue/01. Drawings/07 Mechanical"
    );

    const files = await ftpClient.list();

    for (const f of files) {
      await downloadFile(ftpClient, f.name);
      await uploadFile(
        f.name,
        projectId,
        folderId,
        token.tk as unknown as string
      );
    }

    ftpClient.close();
  } catch (error: Error | any) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }

  return res.send([token, project]);
}
