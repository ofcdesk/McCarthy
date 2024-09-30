import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await store.init();

  const hubId = await store.get("syncHubId");
  const projectId = await store.get("syncProjectId");
  const projectName = await store.get("syncProjectName");
  const accFolderPath = await store.get("syncAccFolderPath");
  const ftpFolderPath = await store.get("syncFTPFolderPath");
  const interval = await store.get("syncInterval");
  const weekday = await store.get("syncWeekDay");
  const hour = await store.get("syncHour");
  const lastSync = await store.get("syncLastTime");

  res.send({
    hubId: hubId || undefined,
    projectId: projectId || undefined,
    projectName: projectName || undefined,
    accFolderPath: accFolderPath || undefined,
    ftpFolderPath: ftpFolderPath || undefined,
    interval: interval || undefined,
    weekday: weekday || undefined,
    hour: hour || undefined,
    lastSync: lastSync || undefined,
  });
};

export default withSessionRoute(handler);
