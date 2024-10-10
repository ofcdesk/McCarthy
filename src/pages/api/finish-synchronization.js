import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setSyncStatus } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await setSyncStatus(false, new Date().getTime());

  res.send("Success");
};

export default withSessionRoute(handler);
