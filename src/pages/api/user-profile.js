import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getCurrentUser } = serverRuntimeConfig;
import axios from "axios";

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }
  if (req.query.email === user.email) {
    const currentUser = await getCurrentUser();
    res.send(currentUser);
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
    name: userProfile.given_name + " " + userProfile.family_name,
    email: userProfile.email,
    picture: userProfile.picture,
  });
};

export default withSessionRoute(handler);
