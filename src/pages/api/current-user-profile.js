import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { lock } = serverRuntimeConfig;
import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }

  const release = await lock.acquire();
  await store.init({ writeQueue: true });
  const userName = await store.get("currentUserName");
  const userEmail = await store.get("currentUserEmail");
  const userPicture = await store.get("currentUserPicture");
  release();

  res.send({ userName, userEmail, userPicture });
};

export default withSessionRoute(handler);
