import { withSessionRoute } from "lib/withSession";

const logoutRoute = async (req, res, session) => {
  let returnUrl = req.headers.host;
  if (!returnUrl.includes("http")) {
    if (
      process.env.NODE_ENV === "DEBUG" ||
      process.env.NODE_ENV === "development"
    ) {
      returnUrl = "http://" + returnUrl + "/login";
    } else {
      returnUrl = "https://" + returnUrl + "/login";
    }
  }
  await req.session.destroy();
  res.writeHead(302, {
    Location: returnUrl,
  });
  res.end();
};

export default withSessionRoute(logoutRoute);
