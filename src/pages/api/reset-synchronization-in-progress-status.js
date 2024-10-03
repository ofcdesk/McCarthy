import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await store.init();

  await store.setItem("synchronizationStatus", undefined);

  res.send("Success");
};

export default withSessionRoute(handler);
