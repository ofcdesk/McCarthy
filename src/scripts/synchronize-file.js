const StorageService = require("../services/storageService");
const SiHubService = require("../services/siHubService");
const { Client } = require("basic-ftp");
const axios = require("axios");
const { Writable } = require("stream");

const uploadFileFromFTPToDataManagement = async (
  projectId,
  fileName,
  folderId,
  ftpFilePath
) => {
  let accessToken = await SiHubService.getAccessToken();
  if (accessToken === null) {
    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Error refreshing ACC token",
      true,
      false
    );
    return null;
  }

  let storageLocation;

  await StorageService.setFileSyncStatus(
    ftpFilePath,
    "Creating storage location",
    false,
    false
  );

  console.log("Creating storage location");
  try {
    storageLocation = (
      await axios(
        `https://developer.api.autodesk.com/data/v1/projects/${projectId}/storage`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + accessToken },
          data: {
            jsonapi: { version: "1.0" },
            data: {
              type: "objects",
              attributes: {
                name: fileName,
              },
              relationships: {
                target: {
                  data: { type: "folders", id: folderId },
                },
              },
            },
          },
        }
      )
    ).data.data;
  } catch (error) {
    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Error creating storage location",
      true,
      false
    );
    console.log("Error creating storage location");
    console.log(error.response.data);
    return null;
  }

  let storageObjectInfo = storageLocation.id;
  storageObjectInfo = storageObjectInfo.replace(
    "urn:adsk.objects:os.object:",
    ""
  );
  storageObjectInfo = storageObjectInfo.split("/");

  let signedS3Url = null;

  await StorageService.setFileSyncStatus(
    ftpFilePath,
    "Getting signed S3 URL",
    false,
    false
  );

  const ftpConfig = await StorageService.getFtpConfig();
  const client = new Client(0);

  let uploadKey;

  try {
    await client.access(ftpConfig);
    client.availableListCommands = ["LIST"];

    console.log("Downloading file from FTP...");

    const fileSize = await client.size(ftpFilePath);

    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Uploading file to S3",
      false,
      false
    );

    const ChunkSize = 5 << 20;
    const MaxBatches = 25;
    const totalParts = Math.ceil(fileSize / ChunkSize);
    let totalBytesUploaded = 0;
    console.log("Total parts:", totalParts);
    let partsUploaded = 0;
    let uploadUrls = [];

    let fileBuffer = Buffer.alloc(0);

    const uploadProcess = new Writable({
      write: async (chunk, encoding, callback) => {
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
        totalBytesUploaded += chunk.byteLength;
        //console.log(`Received ${totalBytesUploaded / 1048576}mb.`);
        //console.log(`Completed ${(totalBytesUploaded / fileSize) * 100}%`);
        if (fileBuffer.byteLength < ChunkSize) {
          callback();
          return;
        }
        console.log("Downloading part", partsUploaded + 1);

        while (true) {
          console.log("Uploading part", partsUploaded + 1);
          if (uploadUrls.length === 0) {
            // Automatically retries 429 and 500-599 responses

            const parts = Math.min(totalParts - partsUploaded, MaxBatches);
            let endpoint =
              "https://developer.api.autodesk.com/oss/v2/buckets/" +
              storageObjectInfo[0] +
              "/objects/" +
              storageObjectInfo[1] +
              `/signeds3upload?minutesExpiration=60&parts=${parts}&firstPart=${
                partsUploaded + 1
              }`;
            if (uploadKey) {
              endpoint += `&uploadKey=${uploadKey}`;
            }

            accessToken = await SiHubService.getAccessToken();
            if (accessToken === null) {
              await StorageService.setFileSyncStatus(
                ftpFilePath,
                "Error refreshing ACC token",
                true,
                false
              );
              return null;
            }

            try {
              signedS3Url = (
                await axios(endpoint, {
                  method: "GET",
                  headers: { Authorization: "Bearer " + accessToken },
                })
              ).data;
            } catch (error) {
              await StorageService.setFileSyncStatus(
                ftpFilePath,
                "Error getting signed S3 URL",
                true,
                false
              );
              console.log("Error getting signed S3 URL");
              console.log(error);
              uploadKey = null;
              return null;
            }

            uploadUrls = signedS3Url.urls.slice();
            uploadKey = signedS3Url.uploadKey;
          }
          const url = uploadUrls.shift();
          try {
            await axios.put(url, fileBuffer);
            break;
          } catch (err) {
            await StorageService.setFileSyncStatus(
              ftpFilePath,
              "Error uploading file to S3",
              true,
              false
            );
            console.log("Error uploading file:");
            console.log(err);
            if (err.response) {
              console.log(JSON.stringify(err.response));
            }
            client.close();
            uploadKey = null;
            return null;
          }
        }
        console.log("Part successfully uploaded", partsUploaded + 1);
        partsUploaded++;
        fileBuffer = Buffer.alloc(0);
        callback();
      },
    });
    await client.downloadTo(uploadProcess, ftpFilePath);

    //Final chunk upload
    while (true) {
      console.log("Uploading part", partsUploaded + 1);
      if (uploadUrls.length === 0) {
        // Automatically retries 429 and 500-599 responses

        const parts = Math.min(totalParts - partsUploaded, MaxBatches);
        let endpoint =
          "https://developer.api.autodesk.com/oss/v2/buckets/" +
          storageObjectInfo[0] +
          "/objects/" +
          storageObjectInfo[1] +
          `/signeds3upload?minutesExpiration=60&parts=${parts}&firstPart=${
            partsUploaded + 1
          }`;
        if (uploadKey) {
          endpoint += `&uploadKey=${uploadKey}`;
        }

        accessToken = await SiHubService.getAccessToken();
        if (accessToken === null) {
          await StorageService.setFileSyncStatus(
            ftpFilePath,
            "Error refreshing ACC token",
            true,
            false
          );
          return null;
        }

        try {
          signedS3Url = (
            await axios(endpoint, {
              method: "GET",
              headers: { Authorization: "Bearer " + accessToken },
            })
          ).data;
        } catch (error) {
          await StorageService.setFileSyncStatus(
            ftpFilePath,
            "Error getting signed S3 URL",
            true,
            false
          );
          console.log("Error getting signed S3 URL");
          console.log(error);
          uploadKey = null;
          return null;
        }

        uploadUrls = signedS3Url.urls.slice();
        uploadKey = signedS3Url.uploadKey;
      }
      const url = uploadUrls.shift();
      try {
        await axios.put(url, fileBuffer);
        console.log("Final Part successfully uploaded");
        break;
      } catch (err) {
        await StorageService.setFileSyncStatus(
          ftpFilePath,
          "Error uploading file to S3",
          true,
          false
        );
        console.log("Error uploading file:");
        console.log(err);
        if (err.response) {
          console.log(JSON.stringify(err.response));
        }
        client.close();
        uploadKey = null;
        return null;
      }
    }
    //console.log("Part successfully uploaded", partsUploaded + 1);
    partsUploaded++;

    client.close();
  } catch (error) {
    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Error uploading file to S3",
      true,
      false
    );
    console.log("Error uploading file:");
    if (error.response) {
      console.log(JSON.stringify(error.response));
    }
    client.close();
    uploadKey = null;
    return null;
  }

  if (uploadKey === null) {
    return null;
  }

  accessToken = await SiHubService.getAccessToken();
  if (accessToken === null) {
    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Error refreshing ACC token",
      true,
      false
    );
    return null;
  }

  await StorageService.setFileSyncStatus(
    ftpFilePath,
    "Finalizing upload",
    false,
    false
  );

  console.log("Finalizing upload");
  try {
    await axios(
      "https://developer.api.autodesk.com/oss/v2/buckets/" +
        storageObjectInfo[0] +
        "/objects/" +
        storageObjectInfo[1] +
        "/signeds3upload",
      {
        headers: { Authorization: "Bearer " + accessToken },
        data: { uploadKey },
        method: "POST",
      }
    );
  } catch (error) {
    await StorageService.setFileSyncStatus(
      ftpFilePath,
      "Error finalizing upload",
      true,
      false
    );
    console.log("Error finalizing upload");
    console.log(error);
    return null;
  }

  return storageLocation.id;
};

process.stdin.on("data", async (data) => {
  const _data = JSON.parse(data);
  console.log("Received from parent: ", _data);
  await StorageService.init();
  await SiHubService.init();

  if (_data.accFileId === undefined) {
    console.log("Item does not exist");

    const storageLocationId = await uploadFileFromFTPToDataManagement(
      _data.projectId,
      _data.fileName,
      _data.accFolderId,
      _data.ftpPath + "/" + _data.fileName
    );

    if (storageLocationId === null) {
      return;
    }
    const accessToken = await SiHubService.getAccessToken();

    try {
      await axios(
        `https://developer.api.autodesk.com/data/v1/projects/${_data.projectId}/items`,
        {
          headers: { Authorization: "Bearer " + accessToken },
          data: {
            jsonapi: { version: "1.0" },
            data: {
              type: "items",
              attributes: {
                displayName: _data.fileName,
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
                    id: _data.accFolderId,
                  },
                },
              },
            },
            included: [
              {
                type: "versions",
                id: "1",
                attributes: {
                  name: _data.fileName,
                  extension: {
                    type: "versions:autodesk.bim360:File",
                    version: "1.0",
                  },
                },
                relationships: {
                  storage: {
                    data: {
                      type: "objects",
                      id: storageLocationId,
                    },
                  },
                },
              },
            ],
          },
          method: "POST",
        }
      );
    } catch (error) {
      await StorageService.setFileSyncStatus(
        _data.ftpPath + "/" + _data.fileName,
        "Error creating item on Data Management",
        true,
        false
      );
      console.log("Error creating item on Data Management");
      if (error?.response?.data) {
        console.log(error.response.data);
      }
      return;
    }

    await StorageService.setFileLastDate(
      _data.ftpPath + "/" + _data.fileName,
      _data.lastDate
    );
  } else {
    console.log("Item exists");

    const lastDate = await StorageService.getFileLastDate(
      _data.ftpPath + "/" + _data.fileName
    );

    if (_data.lastDate !== lastDate) {
      console.log("Updating file");

      const storageLocationId = await uploadFileFromFTPToDataManagement(
        _data.projectId,
        _data.fileName,
        _data.accFolderId,
        _data.ftpPath + "/" + _data.fileName
      );

      const accessToken = await getAccessToken();
      if (storageLocationId === null) {
        return;
      }

      try {
        await axios(
          `https://developer.api.autodesk.com/data/v1/projects/${_data.projectId}/versions`,
          {
            headers: { Authorization: "Bearer " + accessToken },
            data: {
              jsonapi: { version: "1.0" },
              data: {
                type: "versions",
                attributes: {
                  name: _data.fileName,
                  extension: {
                    type: "versions:autodesk.bim360:File",
                    version: "1.0",
                  },
                },
                relationships: {
                  item: {
                    data: {
                      type: "items",
                      id: _data.accFileId,
                    },
                  },
                  storage: {
                    data: {
                      type: "objects",
                      id: storageLocationId,
                    },
                  },
                },
              },
            },
            method: "POST",
          }
        );

        await StorageService.setFileLastDate(
          _data.ftpPath + "/" + _data.fileName,
          _data.lastDate
        );
      } catch (error) {
        await StorageService.setFileSyncStatus(
          _data.ftpPath + "/" + _data.fileName,
          "Error updating item on Data Management",
          true,
          false
        );
        console.log("Error updating item on Data Management");
        console.log(error);
        return;
      }
    }
  }

  await StorageService.setFileSyncStatus(
    _data.ftpPath + "/" + _data.fileName,
    "Sync completed",
    false,
    true
  );
});
