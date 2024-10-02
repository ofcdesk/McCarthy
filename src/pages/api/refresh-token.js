import axios from "axios";
import { withSessionRoute } from "lib/withSession";

const refreshTokenRoute = async (req, res) => {
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
    const newToken = await axios.get(
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
        "/api/acc/auth/refresh-token?application_token=" +
        process.env.APPLICATION_TOKEN +
        "&access_token=" +
        req.session.user.access_token +
        "&refresh_token=" +
        req.session.user.refresh_token
    );

    req.session.user = {
      ...req.session.user,
      access_token: newToken.data.access_token,
      expires_at: Number(new Date().getTime() + 600 * 1000),
      refresh_token: newToken.data.refresh_token,
      logged_in: Date.now(),
    };

    await req.session.save();

    res.send({
      access_token: newToken.data.access_token,
      expires_at: Number(new Date().getTime() + 600 * 1000),
      refresh_token: newToken.data.refresh_token,
    });
  } catch (error) {
    console.log(error);
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
  }
};

export default withSessionRoute(refreshTokenRoute);
