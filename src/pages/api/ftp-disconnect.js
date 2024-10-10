import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { resetFtpConfig, resetSynchronizationConfig } = serverRuntimeConfig;

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

  await resetFtpConfig();
  await resetSynchronizationConfig();

  res.send({ message: "FTP connection closed" });
};

export default withSessionRoute(handler);
