import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { refreshToken } = serverRuntimeConfig;

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

  const result = await refreshToken();

  if (result === "Unauthorized") {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  res.send("Success");
};

export default withSessionRoute(handler);
