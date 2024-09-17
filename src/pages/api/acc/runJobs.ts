// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { getCommentsSizeACC } from "@/lib/commentSizeHelper";
import {
  getRFICommentLinks,
  setRFICommentLinks,
} from "@/lib/commentsRfiHelper";
import { getConnections } from "@/lib/connectionHelper";
import { getLinks } from "@/lib/linkHelper";
import { getRFIStatusACCRFI, setRFIStatusACCRFI } from "@/lib/rfiStatusHelper";
import {
  getACCTokenFromCompanyId,
  getCompanies,
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
  const companies = await getCompanies();
  companies.forEach(async (company: any) => {
    const companyId = company.id;
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

    connections.forEach((connection: any) => {
      connection.accProjects.forEach((project: any) => {
        const connection = connections.find((c: any) =>
          c.accProjects.find((p: any) => p.id.includes(project.id))
        );

        if (!connection) return;

        fetch(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
            "/api/acc/v2/get-rfis/" +
            project.id.slice(2) +
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
              throw new Error("Failed to fetch RFIS");
            }
            return response.json();
          })
          .then((data) => {
            data.results.forEach(
              async (r: {
                id: string;
                commentsCount: number;
                status: string;
              }) => {
                const commentLinks = await getRFICommentLinks(r.id);
                const rfiLinks = await getLinks(r.id);

                if (!rfiLinks) {
                  console.log("No links found for rfi", r.id);
                  return;
                }

                const procoreRFIId = rfiLinks[0];

                if (!procoreRFIId) {
                  console.log("No procore link found for rfi", r.id);
                  return;
                }

                const DBStatus = await getRFIStatusACCRFI(r.id);

                if (r.status != DBStatus) {
                  console.log("Status Update", {
                    rfiId: r.id,
                    status: r.status,
                    dbStatus: DBStatus,
                  });

                  const procoreToken = await getProcoreTokenFromCompanyId(
                    companyId
                  );

                  fetch(
                    "https://sandbox.procore.com/rest/v1.0/projects/" +
                      connection.procoreProject.id +
                      "/rfis/" +
                      procoreRFIId,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${procoreToken.access_token}`,
                      },
                      body: JSON.stringify({
                        rfi: {
                          accepted: r.status == "closed" ? true : false,
                          status: r.status,
                        },
                      }),
                    }
                  ).then((response) => {
                    if (!response.ok) {
                      console.log(response);
                      throw new Error("Failed to update rfi status");
                    }
                    return response.json();
                  });

                  await setRFIStatusACCRFI(r.status, r.id);
                }

                if (!r.commentsCount) r.commentsCount = 0;
                if (r.commentsCount == 0) return;

                const dbCount = await getCommentsSizeACC(r.id);
                if (dbCount != r.commentsCount) {
                  // run job

                  const comments = await fetch(
                    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
                      "/api/acc/v2/get-rfi-comments/" +
                      project.id.slice(2) +
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
                          procoreRFIId,
                          connection.procoreProject.id,
                          companyId.toString(),
                          comment.body
                        );
                        return;
                      }

                      if (commentLinks.includes(comment.id)) return;
                      console.log("comment links:", commentLinks);

                      console.log("Adding link for comment", comment.id);
                      await setRFICommentLinks(
                        [...commentLinks, comment.id],
                        r.id
                      );

                      console.log("Creating comment in Procore");

                      // create comment

                      await postProcoreReply(
                        procoreRFIId,
                        connection.procoreProject.id,
                        companyId.toString(),
                        comment.body
                      );
                    }
                  );
                }
              }
            );
          });
      });
    });
  });

  return res.status(200).json({ message: "Success" });
}
