import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getUserProjects } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
  }

  if (req.query.forceRefresh === undefined) {
    URL += "&useCache=true";
  }

  const userProjects = await getUserProjects(
    req.query.forceRefresh !== undefined ? req.query.forceRefresh : false
  );

  res.send(userProjects);
};

export default withSessionRoute(handler);
