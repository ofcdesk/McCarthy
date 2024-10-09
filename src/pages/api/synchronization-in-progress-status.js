import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { lock } = serverRuntimeConfig;
import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }
  const release = await lock.acquire();
  await store.init({ writeQueue: true });

  const synchronizationStatus = await store.getItem("synchronizationStatus");

  release();
  res.send(synchronizationStatus);
};

export default withSessionRoute(handler);
