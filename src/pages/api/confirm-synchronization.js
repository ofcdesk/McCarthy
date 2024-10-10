import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setSynchronizationConfig } = serverRuntimeConfig;

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

  res.send("Success");
};

export default withSessionRoute(handler);
