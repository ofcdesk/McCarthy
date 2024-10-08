import axios from "axios";
import { withSessionRoute } from "lib/withSession";

const loginRoute = async (req, res) => {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (
    req.query.tk === null ||
    req.query.tk === undefined ||
    req.query.ex === null ||
    req.query.ex === undefined ||
    req.query.rt === null ||
    req.query.rt === undefined
  ) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  let returnUrl = req.headers.host;
  if (!returnUrl.includes("http")) {
    if (
      process.env.NODE_ENV === "DEBUG" ||
      process.env.NODE_ENV === "development"
    ) {
      returnUrl = "http://" + returnUrl;
    } else {
      returnUrl = "https://" + returnUrl;
    }
  }

  let URL =
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
    "/api/acc/v2/user-info?application_token=" +
    process.env.APPLICATION_TOKEN;

  const userProfile = (
    await axios.get(URL, {
      headers: { authorization: req.query.tk },
    })
  ).data;

  if (userProfile === null || userProfile === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }
  const emailCompany = userProfile.email.split("@")[1];
  if (emailCompany !== "ofcdesk.com" && emailCompany !== "mccarthy.com") {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  req.session.user = {
    id: 1,
    admin: true,
    access_token: req.query.tk,
    expires_at: Number(new Date().getTime() + 600 * 1000),
    refresh_token: req.query.rt,
    logged_in: Date.now(),
    origin: returnUrl,
    email: userProfile.email,
  };

  await req.session.save();
  res.writeHead(302, {
    Location: returnUrl,
  });
  res.end();
};

export default withSessionRoute(loginRoute);
