import axios from "axios";
import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }
  if (req.query.email === user.email) {
    await store.init();
    const userName = await store.get("currentUserName");
    const userEmail = await store.get("currentUserEmail");
    const userPicture = await store.get("currentUserPicture");

    res.send({ userName, userEmail, userPicture });
    return;
  }

  let URL =
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
    "/api/acc/v2/user-info?application_token=" +
    process.env.APPLICATION_TOKEN;

  let userProfile = null;
  try {
    userProfile = (
      await axios.get(URL, {
        headers: { authorization: user.access_token },
      })
    ).data;
  } catch (err) {
    if (err.response.data === "Unauthorized") {
      res.statusMessage = "Unauthorized";
      res.status(401).send("Unauthorized");
      return;
    }
  }

  res.send({
    userName: userProfile.given_name + " " + userProfile.family_name,
    userEmail: userProfile.email,
    userPicture: userProfile.picture,
  });
};

export default withSessionRoute(handler);
