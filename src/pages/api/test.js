import { withSessionRoute } from "lib/withSession";
import { spawn } from "child_process";

const handler = async (req, res) => {
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }
  const child = spawn("node", ["./src/scripts/test.js"]); // Run an external script
  child.stdin.write(JSON.stringify({ text: "Hello World!" }));
  child.stdin.end();

  child.stdout.on("data", (data) => {
    console.log(`Child stdout: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`Child stderr: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  res.send("Success");
};

export default withSessionRoute(handler);
