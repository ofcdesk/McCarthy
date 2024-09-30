import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }

  await store.init();
  const userName = await store.get("currentUserName");
  const userEmail = await store.get("currentUserEmail");
  const userPicture = await store.get("currentUserPicture");

  res.send({ userName, userEmail, userPicture });
};

export default withSessionRoute(handler);
