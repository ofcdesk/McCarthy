import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  await store.removeItem("ftpConfig");
  await store.removeItem("syncHubId");
  await store.removeItem("syncProjectId");
  await store.removeItem("syncProjectName");
  await store.removeItem("syncAccFolderPath");
  await store.removeItem("syncFTPFolderPath");
  await store.removeItem("syncInterval");
  await store.removeItem("syncWeekDay");
  await store.removeItem("syncHour");
  await store.removeItem("syncLastTime");

  res.send({ message: "FTP connection closed" });
};

export default withSessionRoute(handler);
