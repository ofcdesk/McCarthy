import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { setTokenInfo, setCurrentUser } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await setTokenInfo(
    req.query.access_token,
    req.query.refresh_token,
    req.query.expires_at
  );

  await setCurrentUser(
    req.query.userName,
    req.query.userEmail,
    req.query.userPicture
  );

  res.send("Success");
};

export default withSessionRoute(handler);
