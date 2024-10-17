import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { stopCron, resetSynchronizationConfig } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  stopCron();
  await resetSynchronizationConfig();

  res.send("Success");
};

export default withSessionRoute(handler);
