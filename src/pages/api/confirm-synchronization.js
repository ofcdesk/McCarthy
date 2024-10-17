import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setSynchronizationConfig, setCron } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await setSynchronizationConfig(
    req.body.hubId,
    req.body.projectId,
    req.body.projectName,
    req.body.accFolderPath,
    req.body.ftpFolderPath,
    req.body.interval,
    req.body.weekDay,
    req.body.hour
  );

  setCron(req.body.interval === "DAILY", req.body.hour, req.body.weekDay);

  res.send("Success");
};

export default withSessionRoute(handler);
