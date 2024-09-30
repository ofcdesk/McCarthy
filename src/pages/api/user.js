import { withSessionRoute } from "lib/withSession";

const userRoute = (req, res) => {
  res.send({ user: req.session.user });
};

export default withSessionRoute(userRoute);
