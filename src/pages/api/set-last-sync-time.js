import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setLastSyncTime } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await setLastSyncTime(req.body.lastTime);

  res.send("Success");
};

export default withSessionRoute(handler);
