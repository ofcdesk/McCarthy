// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  getRFI,
  getRFIReplies,
  getRFIS,
  handleProcoreRFI,
  handleProcoreSubmittal,
} from "@/lib/accController";
import {
  getRFICommentLinks,
  setRFICommentLinks,
} from "@/lib/commentsRfiHelper";
import { getLinks } from "@/lib/linkHelper";
import {
  getACCTokenFromCompanyId,
  getProcoreTokenFromCompanyId,
} from "@/lib/tokenHelper";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSubmittal } from "../procore/getSubmittal";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (req.headers.authorization != process.env.AUTHORIZATION_SECRET) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const token = await getProcoreTokenFromCompanyId(req.body.company_id);

  const accToken = await getACCTokenFromCompanyId(req.body.company_id);

  if (!token || !accToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.body.resource_name == "RFIs") {
    const rfi = await getRFI(
      req.body.project_id,
      req.body.resource_id,
      req.body.company_id,
      // @ts-ignore
      token.access_token
    ).catch(() => null);

    handleProcoreRFI(req.body, rfi);

    res.status(200).json({ message: "RFI received" });
  }

  if (req.body.resource_name == "Submittals") {
    const submittal = await getSubmittal(
      req.body.project_id,
      req.body.resource_id,
      req.body.company_id,
      // @ts-ignore
      token.access_token
    ).catch(() => null);

    handleProcoreSubmittal(req.body, submittal);

    res.status(200).json({ message: "Submittal created" });
  }

  if (req.body.resource_name == "RFI Replies") {
    console.log(req.body);

    console.log(req.body.project_id, req.body.id, req.body.company_id);

    const rfis = await getRFIS(
      req.body.project_id,
      req.body.company_id,
      // @ts-ignore
      token.access_token
    ).catch(() => null);

    rfis.forEach(async (rfi: any) => {
      const replies = await getRFIReplies(
        req.body.project_id,
        rfi.id,
        req.body.company_id,
        // @ts-ignore
        token.access_token
      );

      const reply = replies.find((r: any) => r.id == req.body.resource_id);
      if (!reply) return;

      const links = await getLinks(rfi.id);

      links.forEach((link: any) => {
        const rfiId = link[0];
        const projectId = link[1];
        // console.log(req.body.project_id);

        console.log(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
            "/api/acc/v2/create-rfi-comment/" +
            projectId.slice(2) +
            "/" +
            rfiId +
            "?application_token=" +
            process.env.SIHUB_APPLICATION_TOKEN!
        );

        fetch(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
            "/api/acc/v2/create-rfi-comment/" +
            projectId.slice(2) +
            "/" +
            rfiId +
            "?application_token=" +
            process.env.SIHUB_APPLICATION_TOKEN!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // @ts-ignore
              Authorization: accToken.tk,
            },
            body: JSON.stringify({
              body: reply.plain_text_body,
            }),
          }
        ).then(async (response) => {
          if (!response.ok) {
            console.log(response);
            throw new Error("Failed to create rfi comment");
          }
          const comment = await response.json();
          const commentLinks = await getRFICommentLinks(rfiId);

          setRFICommentLinks([...commentLinks, comment.id], rfiId);
        });
      });
    });

    //console.log(rfis);

    res.status(200).json({ message: "RFI Reply received" });

    // const reply = await getRFIReply(
    //   req.body.project_id,
    //   req.body.rfi_id,
    //   req.body.company_id,
    //   req.body.resource_id,
    //   // @ts-ignore
    //   token.access_token
    // );
  }
}
