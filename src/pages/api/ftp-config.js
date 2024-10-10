import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getFtpConfig } = serverRuntimeConfig;
import { Client } from "basic-ftp";

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
  const ftpConfig = await getFtpConfig();

  if (ftpConfig === undefined) {
    res.send({
      user: undefined,
      host: undefined,
      password: undefined,
      error: undefined,
      errorMessage: undefined,
    });
    return;
  }
  const client = new Client();
  //client.ftp.verbose = true;

  try {
    console.log("checking ftp connection");
    await client.access(ftpConfig);

    const list = await client.list();
    client.close();
    if (list.length === 0) {
      res.send({
        user: ftpConfig.user,
        host: ftpConfig.host,
        password: ftpConfig.password,
        error: true,
        errorMessage: "No folders available found",
      });
      return;
    }
  } catch (error) {
    client.close();
    res.send({
      user: ftpConfig.user,
      host: ftpConfig.host,
      password: ftpConfig.password,
      error: true,
      errorMessage: JSON.stringify(error),
    });
    return;
  }

  res.send({
    user: ftpConfig.user,
    host: ftpConfig.host,
    password: ftpConfig.password,
    error: false,
  });
};

export default withSessionRoute(handler);
