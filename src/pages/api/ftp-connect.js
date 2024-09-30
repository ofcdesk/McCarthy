import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");
import { Client } from "basic-ftp";

const handler = async (req, res) => {
  if (
    req.method !== "POST" ||
    req.body.host === undefined ||
    req.body.user === undefined ||
    req.body.password === undefined
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

  const ftpConfig = {
    host: req.body.host,
    user: req.body.user,
    password: req.body.password,
    secure: "implicit",
    port: 990,
  };

  const client = new Client();
  //client.ftp.verbose = true;

  try {
    console.log("connecting to ftp");
    await client.access(ftpConfig);

    try {
      const list = await client.list();

      if (list.length === 0) {
        res.statusMessage = "The FTP server is empty";
        res.status(406).send("The FTP server is empty");
        return;
      }
      await store.init();
      await store.setItem("ftpConfig", ftpConfig);
      res.send({
        message: "FTP connection successful and read permission granted",
      });
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

export default withSessionRoute(handler);
