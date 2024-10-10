const StorageService = require("../services/storageService");
const SiHubService = require("../services/siHubService");
const { Client } = require("basic-ftp");
const axios = require("axios");
const { spawn } = require("child_process");

process.stdin.on("data", async (data) => {
  const _data = JSON.parse(data);
  console.log("Received from parent: ", _data);

  await StorageService.init();
  await SiHubService.init();

  console.log("Starting synchronization");
  const client = new Client();
  const ftpConfig = await StorageService.getFtpConfig();

  const stack = [
    {
      ftpPath: _data.ftpPath,
      accPath: _data.accPath,
      accFolderId: _data.accFolderId,
    },
  ];

  while (stack.length > 0) {
    const { ftpPath, accPath, accFolderId } = stack.pop();

    console.log("Syncing", ftpPath, accPath, accFolderId);

    let response = null;
    try {
      await client.access(ftpConfig);
      await client.cd(ftpPath);

      response = await client.list();
    } catch (err) {
      console.log("FTP error:", err);
    } finally {
      client.close();
    }

    if (response === null) {
      await StorageService.setFileSyncStatus(
        ftpPath,
        "Error connecting to FTP",
        true,
        false
      );
      continue;
    }

    const accFolderContents = await SiHubService.getFolderContents(
      _data.hubId,
      _data.projectId,
      accPath,
      ["folders", "items"]
    );

    if (accFolderContents === null) {
      await StorageService.setFileSyncStatus(
        accPath,
        "Error getting folder contents",
        true,
        false
      );
      continue;
    }

    for (const item of response) {
      console.log("Syncing", item.name);

      await StorageService.setFileSyncStatus(
        ftpPath + "/" + item.name,
        "Starting sync",
        false,
        false
      );

      if (item.isDirectory) {
        const folderExists = accFolderContents.find(
          (_item) => _item.attributes.name === item.name
        );
        if (folderExists === undefined) {
          console.log("Folder does not exist");
          const accessToken = await SiHubService.getAccessToken();
          if (accessToken === null) {
            await StorageService.setFileSyncStatus(
              ftpPath + "/" + item.name,
              "Error getting access token",
              false,
              false
            );
            continue;
          }
          console.log("Creating folder on Data Management");
          try {
            const createdFolder = (
              await axios(
                `https://developer.api.autodesk.com/data/v1/projects/${_data.projectId}/folders`,
                {
                  method: "POST",
                  headers: { Authorization: "Bearer " + accessToken },
                  data: {
                    jsonapi: { version: "1.0" },
                    data: {
                      type: "folders",
                      attributes: {
                        name: item.name,
                        extension: {
                          type: "folders:autodesk.bim360:Folder",
                          version: "1.0",
                        },
                      },
                      relationships: {
                        parent: {
                          data: {
                            type: "folders",
                            id: accFolderId,
                          },
                        },
                      },
                    },
                  },
                }
              )
            ).data;

            await StorageService.setFileSyncStatus(
              ftpPath + "/" + item.name,
              "Folder created on Data Management",
              false,
              false
            );

            stack.push({
              ftpPath: `${ftpPath}/${item.name}`,
              accPath: `${accPath}/${item.name}`,
              accFolderId: createdFolder.data.id,
            });
          } catch (error) {
            console.log("Error creating folder on Data Management");
            if (error?.response?.data) {
              console.log(error.response.data);
            }
            await StorageService.setFileSyncStatus(
              ftpPath + "/" + item.name,
              "Error creating folder on Data Management",
              true,
              false
            );
          }
        } else {
          stack.push({
            ftpPath: `${ftpPath}/${item.name}`,
            accPath: `${accPath}/${item.name}`,
            accFolderId: folderExists.id,
          });
        }
        continue;
      }

      const accFileId =
        accFolderContents.find(
          (_item) => _item.attributes.displayName === item.name
        )?.id || undefined;

      const child = spawn("node", ["./src/scripts/synchronize-file.js"]); // Run an external script
      child.stdin.write(
        JSON.stringify({
          hubId: _data.hubId,
          projectId: _data.projectId,
          accPath: accPath,
          fileName: item.name,
          ftpPath: ftpPath,
          accFolderId: accFolderId,
          lastDate: item.rawModifiedAt,
          accFileId: accFileId,
        })
      );
      child.stdin.end();

      child.stdout.on("data", (data) => {
        console.log(`Child stdout: ${data}`);
      });

      child.stderr.on("data", (data) => {
        console.error(`Child stderr: ${data}`);
      });

      child.on("close", (code) => {
        console.log(`Child process exited with code ${code}`);
      });

      let actualStatus = await StorageService.getFileSyncStatus();
      if (
        actualStatus.status !== undefined &&
        actualStatus.file !== undefined &&
        actualStatus.error !== undefined &&
        actualStatus.uploadCompleted !== undefined
      ) {
        while (
          actualStatus.uploadCompleted === false &&
          actualStatus.error === false
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          actualStatus = await StorageService.getFileSyncStatus();
        }
      }
    }
  }

  await StorageService.setSyncStatus(false, new Date().getTime());
});
