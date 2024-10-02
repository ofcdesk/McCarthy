import axios from "axios";
const store = require("node-persist");
import { withSessionRoute } from "lib/withSession";

const refreshTokenRoute = async (req, res) => {
  if (
    req.method !== "POST" ||
    req.body.path === undefined ||
    req.body.path === null ||
    req.body.hubId === undefined ||
    req.body.hubId === null ||
    req.body.projectId === undefined ||
    req.body.projectId === null
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

  await store.init();
  let accessToken = await store.get("access_token");
  try {
    let folderContents = (
      await axios(
        process.env.NEXT_PUBLIC_API_URL_DOMAIN +
          "/api/acc/v2/query-project-folder-contents/" +
          req.body.hubId +
          "/" +
          req.body.projectId +
          "?application_token=" +
          process.env.APPLICATION_TOKEN,
        {
          method: "POST",
          headers: { Authorization: accessToken },
          data: {
            path: req.body.path,
            filterType:
              req.body.foldersOnly !== undefined &&
              req.body.foldersOnly === true
                ? ["folders"]
                : ["folders", "items"],
            useCache: false,
          },
        }
      )
    ).data;
    res.send(folderContents);
    return;
  } catch (err) {
    console.log("error on getting folder contents");
    console.log(err);
  }

  res.send([]);
};

export default withSessionRoute(refreshTokenRoute);
