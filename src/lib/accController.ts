import { ACCProject, ProcoreProject } from "@/pages";
import axios from "axios";
import { getConnections } from "./connectionHelper";
import { setLinks } from "./linkHelper";
import { Submittal } from "./procoreTypes";
import {
  getACCTokenFromCompanyId,
  getProcoreTokenFromCompanyId,
} from "./tokenHelper";

type SubmitACCRFI = {
  title: string;
  status: string;
  question?: string;
  description?: string;
  location?: {
    description?: string;
  };
  dueDate?: string;
};

type IncomingRequest = {
  id: string;
  ulid: string;
  timestamp: string;
  metadata: {
    source_user_id: number;
    source_project_id: number;
    source_operation_id: number | null;
    source_company_id: number;
    source_application_id: string;
  };
  user_id: number;
  company_id: number;
  project_id: number;
  api_version: string;
  event_type: string;
  resource_name: string;
  resource_id: number;
};

export async function handleProcoreRFI(event: IncomingRequest, eventRFI: any) {
  if (event.event_type == "create") {
    const connections = await getConnections(event.company_id.toString());

    const connection = connections.find(
      (connection: {
        procoreProject: ProcoreProject;
        accProjects: ACCProject[];
      }) => connection.procoreProject.id == event.project_id.toString()
    );

    if (!connection) {
      console.log("Connection not found");
      return;
    }

    const accToken = await getACCTokenFromCompanyId(event.company_id);

    let createACCRFIBody: SubmitACCRFI = {
      title: eventRFI.title,
      question: eventRFI.question.plain_text_body,
      status: eventRFI.status == "open" ? "open" : "draft",
    };

    if (eventRFI.description) {
      createACCRFIBody.description = eventRFI.description;

      createACCRFIBody.location = {
        description: eventRFI.description,
      };
    }

    if (eventRFI.due_date) {
      createACCRFIBody.dueDate = eventRFI.due_date;
    }

    const hasAttachments = eventRFI.question?.attachments?.length > 0;

    const procoreToken = await getProcoreTokenFromCompanyId(event.company_id);
    const attachments = hasAttachments
      ? await Promise.all(
          eventRFI.question.attachments.map(async (attachment: any) => {
            const attachmentUrl = attachment.url;

            const s3Url = await axios({
              method: "get",
              url: attachmentUrl,
              headers: {
                Authorization: "Bearer " + procoreToken.access_token,
              },
            }).catch((err) => {
              console.error(err);
              return null;
            });

            if (!s3Url) {
              console.error("Failed to get s3 url");
              return null;
            }

            const s3FileURL = s3Url.request.res.responseUrl;

            const s3File = await axios({
              method: "get",
              url: s3FileURL,
              responseType: "arraybuffer",
            }).catch((err) => {
              console.error(err);
              return null;
            });

            if (!s3File) {
              console.error("Failed to get s3 file");
              return;
            }

            return s3File;
          })
        )
      : [];

    const ids = await Promise.all(
      connection.accProjects.map((accProject: ACCProject) => {
        return fetch(
          process.env.NEXT_PUBLIC_API_URL +
            "/api/acc/v2/create-rfi/" +
            accProject.relationships.rfis.data.id +
            "?application_token=" +
            process.env.SIHUB_APPLICATION_TOKEN,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: accToken.tk,
            },
            body: JSON.stringify(createACCRFIBody),
          }
        )
          .then(async (res) => {
            if (res.status != 200) {
              console.error("Error submitting RFI", res);
            }

            console.log("RFI submitted");

            const accRFI = await res.json();
            console.log(accRFI);

            if (hasAttachments) {
              const hubId = accProject.relationships.hub.data.id;

              const rfiFolders = await fetch(
                process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
                  "/api/acc/v2/query-project-folder-contents/" +
                  hubId +
                  "/" +
                  accProject.id +
                  "?application_token=" +
                  process.env.SIHUB_APPLICATION_TOKEN!,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: accToken.tk,
                  },
                  body: JSON.stringify({
                    path: "Project Files",
                    filterType: ["folders"],
                  }),
                }
              ).then((response) => {
                if (!response.ok) {
                  console.log(response);
                  throw new Error("Failed to get project files");
                }
                return response.json();
              });

              if (!rfiFolders) {
                console.error("RFI folder not found");
                return null;
              }

              const rfiFolder = rfiFolders.find(
                (r: any) => r.attributes.name === "RFIS"
              );

              if (!rfiFolder) {
                console.error("RFI folder not found");
                return null;
              }

              attachments.forEach(async (attachment: any) => {
                const formData = new FormData();
                const fileName =
                  eventRFI.id +
                  "_" +
                  attachment.headers["content-disposition"]
                    .split("filename=")[1]
                    .replace(/"/g, "");

                formData.append(
                  "data",
                  JSON.stringify({
                    relationship: {
                      type: "file",
                      folderId: rfiFolder.id,
                      fileName,
                    },
                    rfiId: accRFI.id,
                  })
                );

                const fileBlob = new Blob([attachment.data]);
                formData.append(fileName, fileBlob, fileName);

                axios(
                  process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
                    "/api/acc/v2/create-rfi-relationship/" +
                    accProject.id +
                    "?application_token=" +
                    process.env.SIHUB_APPLICATION_TOKEN!,
                  {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer " + accToken.tk,
                      "Content-Type": "multipart/form-data",
                    },
                    data: formData,
                  }
                )
                  .then((response) => {
                    console.log(response);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              });
            }

            setLinks([event.resource_id.toString()], accRFI.id);

            return [accRFI.id, accProject.id];
          })
          .catch((error) => {
            console.error("Error submitting RFI", error);
            return null;
          });
      })
    );

    setLinks(ids, event.resource_id.toString());
  } else {
    /* if (event.event_type == "update") {
    const token = await getProcoreTokenFromCompanyId(event.company_id);

    const rfi = await getRFI(
      event.project_id.toString(),
      event.resource_id.toString(),
      event.company_id.toString(),
      // @ts-ignore
      token.access_token
    );

    if (!rfi) {
      console.log("RFI not found");
      return;
    }

    const links: string[] = await getLinks(event.resource_id.toString());

    // links.forEach(async (accRFIId: string) => {
      // const accToken = await getACCTokenFromCompanyId(event.company_id);
      // fetch(
      //   process.env.NEXT_PUBLIC_API_URL +
      //     "/api/acc/v2/update-rfi/" +
      //     accRFIId +
      //     "?application_token=" +
      //     process.env.SIHUB_APPLICATION_TOKEN,
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: accToken.tk,
      //     },
      //     body: JSON.stringify({
      //       status: rfi.status,
      //     }),
      //   }
      // )
      //   .then((res) => {
      //     if (res.status != 200) {
      //       console.error("Error updating RFI", res);
      //     }
      //   })
      //   .catch((error) => {
      //     console.error("Error updating RFI", error);
      //   });
    // });

    // console.log(rfi);
  } */
    console.log(event.event_type);
  }
}

export async function handleProcoreSubmittal(
  event: IncomingRequest,
  eventSubmittal: Submittal
) {
  const connections = await getConnections(event.company_id.toString());

  const connection = connections.find(
    (connection: {
      procoreProject: ProcoreProject;
      accProjects: ACCProject[];
    }) => connection.procoreProject.id == event.project_id.toString()
  );

  if (!connection) {
    console.log("Connection not found");
    return;
  }

  const accToken = await getACCTokenFromCompanyId(event.company_id);

  connection.accProjects.forEach(async (accProject: ACCProject) => {
    processAccProject(accProject, accToken.tk, eventSubmittal);
  });
}

async function fetchSpec(accProjectId: string, accToken: string) {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL_DOMAIN
    }/api/acc/v2/get-specs/${accProjectId.slice(2)}?application_token=${
      process.env.SIHUB_APPLICATION_TOKEN
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: accToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch specs");
  }

  const data = await response.json();
  return data.results.find(
    (spec: { identifier: string }) => spec.identifier === "procore-sync"
  );
}

async function createSpec(accProjectId: string, accToken: string) {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL_DOMAIN
    }/api/acc/v2/create-spec/${accProjectId.slice(2)}?application_token=${
      process.env.SIHUB_APPLICATION_TOKEN
    }`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accToken,
      },
      body: JSON.stringify({
        title: "Procore Sync",
        identifier: "procore-sync",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create spec");
  }

  const data = await response.json();
  console.log("Created spec", data);
  return data;
}

async function createSubmittal(
  accProjectId: string,
  accToken: string,
  typeId: string,
  submittal: Submittal
) {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/acc/v2/create-submittal/${accProjectId.slice(2)}?application_token=${
      process.env.SIHUB_APPLICATION_TOKEN
    }`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accToken,
      },
      body: JSON.stringify({
        title: "Submittal from API",
        typeId: typeId,
        stateId: "draft",
      }),
    }
  );

  if (response.status !== 201) {
    console.error("Error submitting Submittal", response);
  }

  return response.json();
}

async function processAccProject(
  accProject: ACCProject,
  accToken: string,
  submittal: Submittal
) {
  console.log("Submitting Submittal to ACC", accProject.id);

  try {
    let spec = await fetchSpec(accProject.id, accToken);

    if (!spec) {
      console.log("Spec not found, creating spec");
      spec = await createSpec(accProject.id, accToken);
    }

    await createSubmittal(accProject.id, accToken, spec.identifier, submittal);
  } catch (error) {
    console.error("Error processing ACC project", error);
  }
}

export function getRFI(
  project_id: string,
  rfi_id: string,
  company_id: string,
  token: string
) {
  //console.log(project_id, submittal_id, company_id, token);
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-rfi?project_id=" +
      project_id +
      "&rfi_id=" +
      rfi_id +
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
        throw new Error("Failed to fetch RFI");
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

export function getRFIS(project_id: string, company_id: string, token: string) {
  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-rfis?project_id=" +
      project_id +
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
        throw new Error("Failed to fetch RFIs");
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

export function getRFIReplies(
  project_id: string,
  rfi_id: string,
  company_id: string,
  token: string
) {
  //console.log(project_id, submittal_id, company_id, token);

  return fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-rfi-replies?project_id=" +
      project_id +
      "&rfi_id=" +
      rfi_id +
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
        throw new Error("Failed to fetch RFI Replies");
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
