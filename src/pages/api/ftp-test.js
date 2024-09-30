import axios from "axios";
import { withSessionRoute } from "lib/withSession";
const store = require("node-persist");
import { Client } from "basic-ftp";

const buildTree = async (client, path = "") => {
  //Workaround for sharefile that doesn't supports MLSD or LIST with "-a" flag
  client.availableListCommands = ["LIST"];
  const tree = {};
  const list = await client.list(path);
  for (const item of list) {
    const itemPath = path ? `${path}/${item.name}/` : `${item.name}/`;
    if (item.isDirectory) {
      tree[item.name] = await buildTree(client, itemPath);
    } else {
      tree[item.name] = null;
    }
  }
  return tree;
};

const handler = async (req, res) => {
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  const ftpConfig = {
    host: "klaijubawald.sharefileftp.com",
    user: "KlaiJubaWald/dwillis@mccarthy.com",
    password: "McCarthy1864!",
    secure: "implicit",
    port: 990,
  };

  const client = new Client();
  client.availableListCommands = ["LIST"];
  client.ftp.verbose = true;

  try {
    console.log("connecting to ftp");
    await client.access(ftpConfig);

    try {
      client.availableListCommands = ["LIST"];
      /**const files = await client.list(
        "21075 Project M//_ISSUED PACKAGES & PRESENTATIONS//GT - Guitar Tower//2024-06-06 Permit Issue//04. BIM-CAD//21075 Guitar Podium Link//Consultants//CAD//"
      );*/
      await client.cd(
        "21075 Project M//_ISSUED PACKAGES & PRESENTATIONS//GT - Guitar Tower//2024-06-06 Permit Issue//04. BIM-CAD//21075 Guitar Podium Link//Consultants//CAD//05-ARCHITECTURE"
      );
      const files = await client.list();
      /**const files = await client.list(
        "21075 Project M//_ISSUED PACKAGES & PRESENTATIONS//GT - Guitar Tower//2024-06-06 Permit Issue//04. BIM-CAD//21075 Guitar Podium Link//Consultants//CAD//05-ARCHITECTURE"
      );*/
      console.log("Files:", files);
      console.log("Is symbolic:", files[0].isSymbolicLink);
      /**const tree = await buildTree(client);
      console.log("Directory tree:", tree);

      if (tree.length === 0) {
        res.statusMessage = "The FTP server is empty";
        res.status(406).send("The FTP server is empty");
        return;
      }*/
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
