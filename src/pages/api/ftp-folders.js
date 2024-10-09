import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { lock } = serverRuntimeConfig;
const store = require("node-persist");
import { withSessionRoute } from "lib/withSession";
import { Client } from "basic-ftp";

const refreshTokenRoute = async (req, res) => {
  if (
    req.method !== "POST" ||
    req.body.path === undefined ||
    req.body.path === null
  ) {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }
  const release = await lock.acquire();
  const client = new Client();
  //client.ftp.verbose = true;

  await store.init({ writeQueue: true });
  const ftpConfig = await store.getItem("ftpConfig");
  release();

  try {
    await client.access(ftpConfig);

    try {
      if (req.body.path.length > 0) {
        await client.cd(req.body.path);
      }
      const list = await client.list();
      if (req.body.foldersOnly !== undefined && req.body.foldersOnly === true) {
        res.send(
          list
            .filter((item) => item.isDirectory)
            .map((item) => {
              return { ...item, isDirectory: true };
            })
        );
      } else {
        res.send(
          list.map((item) => {
            return { ...item, isDirectory: item.isDirectory };
          })
        );
      }
    } catch (err) {
      console.log("Read permission denied or error:", err);
      res.statusMessage = "Unauthorized";
      res.status(401).send("Unauthorized");
    } finally {
      client.close();
    }
  } catch (error) {
    console.log("FTP connection error:", error);
    console.log(error.code);
    if (error.code === "ENOTFOUND") {
      res.statusMessage = "FTP server not found";
      res.status(404).send("FTP server not found");
      return;
    }
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
  }
};

export default withSessionRoute(refreshTokenRoute);
