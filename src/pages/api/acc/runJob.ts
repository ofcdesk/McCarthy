// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { getCommentsSizeACC } from "@/lib/commentSizeHelper";
import {
  getRFICommentLinks,
  setRFICommentLinks,
} from "@/lib/commentsRfiHelper";
import { getConnections } from "@/lib/connectionHelper";
import { getLinks } from "@/lib/linkHelper";
import {
  getACCTokenFromCompanyId,
  getProcoreTokenFromCompanyId,
} from "@/lib/tokenHelper";

async function postProcoreReply(
  rfiId: string,
  projectId: string,
  companyId: string,
  body: string
) {
  if (
    !process.env.NEXT_PUBLIC_API_URL_DOMAIN ||
    !process.env.SIHUB_APPLICATION_TOKEN
  ) {
    console.log("Missing environment variables");
    return;
  }

  if (!companyId || !projectId || !rfiId || !body) {
    console.log("Missing parameters");
    return;
  }

  console.log(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
      "/api/procore/create-reply?project_id=" +
      projectId +
      "&rfi_id=" +
      rfiId +
      "&company_id=" +
      companyId +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN!
  );

  const procoreToken = await getProcoreTokenFromCompanyId(Number(companyId));

  return fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
      "/api/procore/create-reply?project_id=" +
      projectId +
      "&rfi_id=" +
      rfiId +
      "&company_id=" +
      companyId +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN!,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // @ts-ignore
        Authorization: `Bearer ${procoreToken.access_token}`,
      },
      body: JSON.stringify({
        reply: {
          body,
        },
      }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to create rfi comment");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   const cookieToken = req.cookies.acc_token;
  //   if (!cookieToken) {
  //     return res.status(401).json({ error: "Unauthorized" });
  //   }

  //   const token = jwt.verify(cookieToken, process.env.JWT_SECRET!);
  //   if (!token) {
  //     return res.status(401).json({ error: "Unauthorized" });
  //   }

  const companyId = Number(req.query.company_id);
  const token = await getACCTokenFromCompanyId(companyId);

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const connections = await getConnections(companyId.toString());

  if (!connections) {
    res.status(400).json({ message: "No connections found" });
    return;
  }

  const connection = connections.find((c: any) =>
    c.accProjects.find((p: any) => p.id.includes(req.query.project_id))
  );

  if (!connection) {
    res.status(400).json({ message: "No connection found" });
    return;
  }

  //   const companies = await getCompanies();
  //   const company = companies.find((c: { id: number }) => c.id == companyId);

  //   if (!company) {
  //     res.status(400).json({ message: "Company not found" });
  //     return;
  //   }

  fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
      "/api/acc/v2/get-rfis/" +
      req.query.project_id +
      "?application_token=" +
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
        throw new Error("Failed to fetch specs");
      }
      return response.json();
    })
    .then((data) => {
      data.results.forEach(async (r: { id: string; commentsCount: number }) => {
        if (!r.commentsCount) r.commentsCount = 0;
        if (r.commentsCount == 0) return;

        const dbCount = await getCommentsSizeACC(r.id);
        if (dbCount != r.commentsCount) {
          // run job

          const comments = await fetch(
            process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
              "/api/acc/v2/get-rfi-comments/" +
              req.query.project_id +
              "/" +
              r.id +
              "?application_token=" +
              process.env.SIHUB_APPLICATION_TOKEN!,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // @ts-ignore
                Authorization: token.tk,
              },
            }
          ).then((res) => res.json());

          const commentLinks = await getRFICommentLinks(r.id);
          const rfiLinks = await getLinks(r.id);

          if (!rfiLinks) {
            console.log("No links found for rfi", r.id);
            return;
          }

          const rfiId = rfiLinks[0];

          comments.results.forEach(
            async (comment: {
              id: string;
              body: string;
              createdBy: string;
              createdAt: string;
              updatedAt: string;
            }) => {
              if (commentLinks.length == 0) {
                console.log("No links found for rfi", r.id);
                console.log("Creating comment in Procore");

                await setRFICommentLinks([comment.id], r.id);
                await postProcoreReply(
                  rfiId,
                  connection.procoreProject.id,
                  companyId.toString(),
                  comment.body
                );
                return;
              }

              if (commentLinks.includes(comment.id)) return;

              console.log("Adding link for comment", comment.id);
              await setRFICommentLinks([...commentLinks, comment.id], r.id);

              console.log("Creating comment in Procore");

              // create comment

              await postProcoreReply(
                rfiId,
                connection.procoreProject.id,
                companyId.toString(),
                comment.body
              );
            }
          );
        }
      });
      return res.status(200).json(data);
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
}
