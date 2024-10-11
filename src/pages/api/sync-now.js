import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setSyncStatus, setFileSyncStatus } = serverRuntimeConfig;
import { withSessionRoute } from "lib/withSession";
import { spawn } from "child_process";

const handler = async (req, res) => {
  if (
    req.method !== "POST" ||
    req.body.ftpPath === undefined ||
    req.body.ftpPath === null ||
    req.body.accPath === undefined ||
    req.body.accPath === null ||
    req.body.accFolderId === undefined ||
    req.body.accFolderId === null ||
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

  console.log(req.body.ftpPath);

  await setFileSyncStatus(req.body.ftpPath, "Starting sync", false, false);

  const child = spawn("node", ["./src/scripts/scheduled-synchronization.js"]); // Run an external script
  child.stdin.write(
    JSON.stringify({
      hubId: req.body.hubId,
      projectId: req.body.projectId,
      accPath: req.body.accPath,
      ftpPath: req.body.ftpPath,
      accFolderId: req.body.accFolderId,
    })
  );
  child.stdin.end();

  child.stdout.on("data", (data) => {
    console.log(`Main Child stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`Main Child stderr: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`Main Child process exited with code ${code}`);
  });

  res.send("Success");
};

export default withSessionRoute(handler);
