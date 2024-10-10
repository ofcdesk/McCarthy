import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const {
  lock,
  getAccessToken,
  getFolderContents,
  setSyncStatus,
  setFileSyncStatus,
} = serverRuntimeConfig;
import { withSessionRoute } from "lib/withSession";
import axios from "axios";
import { spawn } from "child_process";

const handler = async (req, res) => {
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

  const release = await lock.acquire();
  await setSyncStatus(true, new Date().getTime());

  console.log(req.body.ftpPath + "/" + req.body.fileName);

  if (req.body.isFolder !== undefined && req.body.isFolder === true) {
    const folderContents = await getFolderContents(
      req.body.hubId,
      req.body.projectId,
      req.body.accPath,
      ["folders"]
    );

    if (folderContents === null) {
      res.send("Error");
      release();
      return;
    }

    const folderExists = folderContents.find(
      (item) => item.attributes.name === req.body.fileName
    );
    if (folderExists === undefined) {
      console.log("Folder does not exist");
      const accessToken = await getAccessToken();
      if (accessToken === null) {
        res.send("Error");
        release();
        return;
      }
      console.log("Creating folder on Data Management");
      try {
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
        release();
        return;
      } catch (error) {
        console.log("Error creating folder on Data Management");
        console.log(error);
        res.send("Error");
        release();
        return;
      }
    } else {
      res.send(folderExists.id);
      release();
      return;
    }
  } else {
    await setFileSyncStatus(
      req.body.ftpPath + "/" + req.body.fileName,
      "Starting sync",
      false,
      false
    );

    const child = spawn("node", ["./src/scripts/synchronize-item.js"]); // Run an external script
    child.stdin.write(
      JSON.stringify({
        hubId: req.body.hubId,
        projectId: req.body.projectId,
        accPath: req.body.accPath,
        fileName: req.body.fileName,
        ftpPath: req.body.ftpPath,
        accFolderId: req.body.accFolderId,
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
    res.send("Success");
  }
  release();
};

export default withSessionRoute(handler);
