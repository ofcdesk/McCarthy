const store = require("node-persist");
import axios from "axios";
import { withSessionRoute } from "lib/withSession";

const handler = async (req, res) => {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    console.log("refreshing token");
    await store.init();
    let accessToken = await store.get("access_token");
    const refreshToken = await store.get("refresh_token");

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
    }
    console.log("token refreshed");
  } catch (error) {
    console.log(error);
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
  }

  res.send("Success");
};

export default withSessionRoute(handler);
