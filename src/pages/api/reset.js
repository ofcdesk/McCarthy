import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { reset, resetTokenInfo } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await reset();
  await resetTokenInfo();

  res.send("Success");
};

export default withSessionRoute(handler);
