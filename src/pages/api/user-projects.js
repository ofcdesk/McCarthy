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

  await store.init();
  let accessToken = await store.get("access_token");
  const refreshToken = await store.get("refresh_token");

  let userProjects = [];

  try {
    userProjects = (
      await axios.get(URL, {
        headers: { authorization: accessToken },
      })
    ).data;
  } catch (err) {
    console.log("error on getting user projects");
    if (err.response.data === "Unauthorized") {
      console.log("trying to refresh the token");
      try {
        const newToken = await axios.get(
          process.env.NEXT_PUBLIC_API_URL_DOMAIN +
            "/api/acc/auth/refresh-token?application_token=" +
            process.env.APPLICATION_TOKEN +
            "&access_token=" +
            accessToken +
            "&refresh_token=" +
            refreshToken
        );

        if (newToken && newToken.data && newToken.data.access_token) {
          await store.set("access_token", newToken.data.access_token);
          await store.set("refresh_token", newToken.data.refresh_token);
          await store.set(
            "expires_in",
            Date.now() + Number(newToken.data.expires_in) * 1000
          );

          accessToken = newToken.data.access_token;
        } else {
          await store.removeItem("access_token");
          await store.removeItem("refresh_token");
          await store.removeItem("expires_in");
          await store.removeItem("currentUserName");
          await store.removeItem("currentUserEmail");
          await store.removeItem("currentUserPicture");
        }
      } catch (errT) {
        console.log("error on refreshing the token");
        if (errT.response.data === "Unauthorized") {
          await store.removeItem("access_token");
          await store.removeItem("refresh_token");
          await store.removeItem("expires_in");
          await store.removeItem("currentUserName");
          await store.removeItem("currentUserEmail");
          await store.removeItem("currentUserPicture");
          res.send("Unauthorized");
          return;
        }
      }
    }
    userProjects = (
      await axios.get(URL, {
        headers: { authorization: accessToken },
      })
    ).data;
  }

  res.send(userProjects);
};

export default withSessionRoute(handler);
