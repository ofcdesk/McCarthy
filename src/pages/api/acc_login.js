const handler = async (req, res) => {
  if (req.method !== "GET") {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }

  let returnUrl = req.headers.host;
  if (!returnUrl.includes("http")) {
    if (
      process.env.NODE_ENV === "DEBUG" ||
      process.env.NODE_ENV === "development"
    ) {
      returnUrl = "http://" + returnUrl;
    } else {
      returnUrl = "https://" + returnUrl;
    }
  }

  res.writeHead(302, {
    Location:
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/acc/auth/login?application_token=" +
      process.env.APPLICATION_TOKEN +
      "&return_url=" +
      encodeURIComponent(returnUrl + "/api/login"),
  });
  res.end();
};

export default handler;
