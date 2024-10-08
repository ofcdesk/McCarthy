import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getCurrentUser } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }
  const currentUser = await getCurrentUser();

  res.send(currentUser);
};

export default withSessionRoute(handler);
