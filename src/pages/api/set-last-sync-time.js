import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await store.init();

  await store.set("syncLastTime", req.body.lastTime);

  res.send("Success");
};

export default withSessionRoute(handler);
