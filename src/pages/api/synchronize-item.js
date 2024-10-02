const store = require("node-persist");
import { withSessionRoute } from "lib/withSession";
import { Client } from "basic-ftp";
import axios from "axios";
import { Writable } from "stream";

const uploadFileFromFTPToS3 = async (ftpConfig, ftpFilePath, s3SignedUrl) => {
  const client = new Client(0);

  try {
    await client.access(ftpConfig);

    let fileBuffer = Buffer.alloc(0);

    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
        callback();
      },
    });

    await client.downloadTo(writableStream, ftpFilePath);

    console.log("Uploading file to S3...");
    await axios.put(s3SignedUrl, fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 600000,
    });

    console.log("File uploaded successfully");
    client.close();
  } catch (error) {
    console.error("Error uploading file:", error);
    client.close();
    return "Error";
  }
  return "Success";
};

const refreshToken = async () => {
  try {
    console.log("refreshing token");
    await store.init();
    let accessToken = await store.get("access_token");
    const refreshToken = await store.get("refresh_token");

    const newToken = await axios.get(
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
        "/api/acc/auth/refresh-token?application_token=" +
        process.env.APPLICATION_TOKEN +
        "&access_token=" +
        accessToken +
        "&refresh_token=" +
        refreshToken
    );

    if (newToken && newToken.data && newToken.data.access_token) {
      await store.set("access_token", newToken.data.access_token);
      await store.set("refresh_token", newToken.data.refresh_token);
      await store.set("expires_at", new Date().getTime() + 600 * 1000);
    }
    console.log("token refreshed");
  } catch (error) {
    await store.removeItem("access_token");
    await store.removeItem("refresh_token");
    await store.removeItem("expires_at");
    await store.removeItem("currentUserName");
    await store.removeItem("currentUserEmail");
    await store.removeItem("currentUserPicture");
    console.log(error);

    return "Unauthorized";
  }
  return "Success";
};

const handler = async (req, res) => {
  console.log(req.body);
  if (
    req.method !== "POST" ||
    req.body.ftpPath === undefined ||
    req.body.ftpPath === null ||
    req.body.accPath === undefined ||
    req.body.accPath === null ||
    req.body.fileName === undefined ||
    req.body.fileName === null ||
    req.body.isFolder === undefined ||
    req.body.isFolder === null ||
    req.body.hubId === undefined ||
    req.body.hubId === null ||
    req.body.projectId === undefined ||
    req.body.projectId === null
  ) {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  await store.init();
  const ftpConfig = await store.getItem("ftpConfig");
  let accessToken = await store.get("access_token");
  const expires_at = await store.getItem("expires_at");
  if (expires_at < new Date().getTime()) {
    const result = await refreshToken();
    if (result === "Unauthorized") {
      res.statusMessage = "Unauthorized";
      res.status(401).send("Unauthorized");
      return;
    }
    accessToken = await store.get("access_token");
  }

  try {
    if (req.body.isFolder !== undefined && req.body.isFolder === true) {
      let folderContents = (
        await axios(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN +
            "/api/acc/v2/query-project-folder-contents/" +
            req.body.hubId +
            "/" +
            req.body.projectId +
            "?application_token=" +
            process.env.APPLICATION_TOKEN,
          {
            method: "POST",
            headers: { Authorization: accessToken },
            data: {
              path: req.body.accPath,
              filterType: ["folders"],
              useCache: false,
            },
          }
        )
      ).data;
      const folderExists = folderContents.find(
        (item) => item.attributes.name === req.body.fileName
      );
      if (folderExists === undefined) {
        const createdFolder = (
          await axios(
            `https://developer.api.autodesk.com/data/v1/projects/${req.body.projectId}/folders`,
            {
              method: "POST",
              headers: { Authorization: "Bearer " + accessToken },
              data: {
                jsonapi: { version: "1.0" },
                data: {
                  type: "folders",
                  attributes: {
                    name: req.body.fileName,
                    extension: {
                      type: "folders:autodesk.bim360:Folder",
                      version: "1.0",
                    },
                  },
                  relationships: {
                    parent: {
                      data: { type: "folders", id: req.body.accFolderId },
                    },
                  },
                },
              },
            }
          )
        ).data;
        res.send(createdFolder.data.id);
        return;
      } else {
        res.send(folderExists.id);
        return;
      }
    } else {
      let folderContents = (
        await axios(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN +
            "/api/acc/v2/query-project-folder-contents/" +
            req.body.hubId +
            "/" +
            req.body.projectId +
            "?application_token=" +
            process.env.APPLICATION_TOKEN,
          {
            method: "POST",
            headers: { Authorization: accessToken },
            data: {
              path: req.body.accPath,
              filterType: ["items"],
              useCache: false,
            },
          }
        )
      ).data;

      const itemExists = folderContents.find(
        (item) =>
          item.attributes.extension.data.sourceFileName === req.body.fileName
      );
      if (itemExists === undefined) {
        console.log("Item does not exist");
        const storageLocation = (
          await axios(
            `https://developer.api.autodesk.com/data/v1/projects/${req.body.projectId}/storage`,
            {
              method: "POST",
              headers: { Authorization: "Bearer " + accessToken },
              data: {
                jsonapi: { version: "1.0" },
                data: {
                  type: "objects",
                  attributes: {
                    name: req.body.fileName,
                  },
                  relationships: {
                    target: {
                      data: { type: "folders", id: req.body.accFolderId },
                    },
                  },
                },
              },
            }
          )
        ).data.data;

        let storageObjectInfo = storageLocation.id;
        storageObjectInfo = storageObjectInfo.replace(
          "urn:adsk.objects:os.object:",
          ""
        );
        storageObjectInfo = storageObjectInfo.split("/");

        let signedS3Url = (
          await axios(
            "https://developer.api.autodesk.com/oss/v2/buckets/" +
              storageObjectInfo[0] +
              "/objects/" +
              storageObjectInfo[1] +
              "/signeds3upload?minutesExpiration=20",
            {
              method: "GET",
              headers: { Authorization: "Bearer " + accessToken },
            }
          )
        ).data;

        const uploadResponse = await uploadFileFromFTPToS3(
          ftpConfig,
          req.body.ftpPath + "/" + req.body.fileName,
          signedS3Url.urls[0]
        );

        if (uploadResponse === "Error") {
          res.send("Error");
          return;
        }

        await axios(
          "https://developer.api.autodesk.com/oss/v2/buckets/" +
            storageObjectInfo[0] +
            "/objects/" +
            storageObjectInfo[1] +
            "/signeds3upload",
          {
            headers: { Authorization: "Bearer " + accessToken },
            data: { uploadKey: signedS3Url.uploadKey },
            method: "POST",
          }
        );

        await axios(
          `https://developer.api.autodesk.com/data/v1/projects/${req.body.projectId}/items`,
          {
            headers: { Authorization: "Bearer " + accessToken },
            data: {
              jsonapi: { version: "1.0" },
              data: {
                type: "items",
                attributes: {
                  displayName: req.body.fileName,
                  extension: {
                    type: "items:autodesk.bim360:File",
                    version: "1.0",
                  },
                },
                relationships: {
                  tip: {
                    data: {
                      type: "versions",
                      id: "1",
                    },
                  },
                  parent: {
                    data: {
                      type: "folders",
                      id: req.body.accFolderId,
                    },
                  },
                },
              },
              included: [
                {
                  type: "versions",
                  id: "1",
                  attributes: {
                    name: req.body.fileName,
                    extension: {
                      type: "versions:autodesk.bim360:File",
                      version: "1.0",
                    },
                  },
                  relationships: {
                    storage: {
                      data: {
                        type: "objects",
                        id: storageLocation.id,
                      },
                    },
                  },
                },
              ],
            },
            method: "POST",
          }
        );

        await store.setItem(
          req.body.ftpPath + "/" + req.body.fileName,
          req.body.lastDate
        );

        res.send("Success");
        return;
      } else {
        console.log("Item exists");

        const lastDate = await store.getItem(
          req.body.ftpPath + "/" + req.body.fileName
        );

        if (req.body.lastDate !== lastDate) {
          console.log("Updating file");

          const storageLocation = (
            await axios(
              `https://developer.api.autodesk.com/data/v1/projects/${req.body.projectId}/storage`,
              {
                method: "POST",
                headers: { Authorization: "Bearer " + accessToken },
                data: {
                  jsonapi: { version: "1.0" },
                  data: {
                    type: "objects",
                    attributes: {
                      name: req.body.fileName,
                    },
                    relationships: {
                      target: {
                        data: { type: "folders", id: req.body.accFolderId },
                      },
                    },
                  },
                },
              }
            )
          ).data.data;

          let storageObjectInfo = storageLocation.id;
          storageObjectInfo = storageObjectInfo.replace(
            "urn:adsk.objects:os.object:",
            ""
          );
          storageObjectInfo = storageObjectInfo.split("/");

          let signedS3Url = (
            await axios(
              "https://developer.api.autodesk.com/oss/v2/buckets/" +
                storageObjectInfo[0] +
                "/objects/" +
                storageObjectInfo[1] +
                "/signeds3upload?minutesExpiration=20",
              {
                method: "GET",
                headers: { Authorization: "Bearer " + accessToken },
              }
            )
          ).data;

          const uploadResponse = await uploadFileFromFTPToS3(
            ftpConfig,
            req.body.ftpPath + "/" + req.body.fileName,
            signedS3Url.urls[0]
          );

          if (uploadResponse === "Error") {
            res.send("Error");
            return;
          }

          await axios(
            "https://developer.api.autodesk.com/oss/v2/buckets/" +
              storageObjectInfo[0] +
              "/objects/" +
              storageObjectInfo[1] +
              "/signeds3upload",
            {
              headers: { Authorization: "Bearer " + accessToken },
              data: { uploadKey: signedS3Url.uploadKey },
              method: "POST",
            }
          );

          await axios(
            `https://developer.api.autodesk.com/data/v1/projects/${req.body.projectId}/versions`,
            {
              headers: { Authorization: "Bearer " + accessToken },
              data: {
                jsonapi: { version: "1.0" },
                data: {
                  type: "versions",
                  attributes: {
                    name: req.body.fileName,
                    extension: {
                      type: "versions:autodesk.bim360:File",
                      version: "1.0",
                    },
                  },
                  relationships: {
                    item: {
                      data: {
                        type: "items",
                        id: itemExists.id,
                      },
                    },
                    storage: {
                      data: {
                        type: "objects",
                        id: storageLocation.id,
                      },
                    },
                  },
                },
              },
              method: "POST",
            }
          );

          await store.setItem(
            req.body.ftpPath + "/" + req.body.fileName,
            req.body.lastDate
          );
        }

        res.send("Success");
        return;
      }
    }
  } catch (error) {
    if (error.response) {
      console.log(JSON.stringify(error.response.data));
    } else {
      console.log(error);
    }
  }
  res.send("Success");
};

export default withSessionRoute(handler);
