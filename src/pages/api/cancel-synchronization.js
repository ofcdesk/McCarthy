import { withSessionRoute } from "lib/withSession";

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  /**await store.init({ writeQueue: true });

  await store.set("syncHubId", req.body.hubId);
  await store.set("syncProjectId", req.body.projectId);
  await store.set("syncAccFolderPath", req.body.accFolderPath);
  await store.set("syncFTPFolderPath", req.body.ftpFolderPath);
  await store.set("syncInterval", req.body.interval);
  await store.set("syncWeekDay", req.body.weekDay);
  await store.set("syncHour", req.body.hour);*/

  res.send("Success");
};

export default withSessionRoute(handler);
