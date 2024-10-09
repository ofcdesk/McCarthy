import axios from "axios";
import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }

  let URL =
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
    "/api/acc/v2/projects?application_token=" +
    process.env.APPLICATION_TOKEN;

  if (req.query.forceRefresh === undefined) {
    URL += "&useCache=true";
  }

  await store.init({ writeQueue: true });
  let accessToken = await store.get("access_token");

  let userProjects = [];

  try {
    userProjects = (
      await axios.get(URL, {
        headers: { authorization: accessToken },
      })
    ).data;
  } catch (err) {
    console.log("error on getting user projects");
    console.log(err);
  }

  res.send(userProjects);
};

export default withSessionRoute(handler);
