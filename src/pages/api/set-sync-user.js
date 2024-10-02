import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  await store.init();

  await store.set("access_token", req.query.access_token);
  await store.set("refresh_token", req.query.refresh_token);
  await store.set("expires_at", req.query.expires_at);
  await store.set("currentUserName", req.query.userName);
  await store.set("currentUserEmail", req.query.userEmail);
  await store.set("currentUserPicture", req.query.userPicture);

  res.send("Success");
};

export default withSessionRoute(handler);
