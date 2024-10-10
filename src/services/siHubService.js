const axios = require("axios");
const _store = require("node-persist");
let store = null;

let LOCK = false;

const init = async () => {
  store = _store.create({ dir: ".node-persist/siHub" });
  await store.init();
  console.log("Initializing siHubService");
};

init();

const setTokenInfo = async (accessToken, refreshToken, expiresAt) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.set("access_token", accessToken);
    await store.set("refresh_token", refreshToken);
    await store.set("expires_at", expiresAt);
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const refreshToken = async () => {
  try {
    console.log("refreshing token");
    let accessToken = await store.get("access_token");
    const refreshToken = await store.get("refresh_token");

    if (
      !accessToken ||
      !refreshToken ||
      accessToken === "undefined" ||
      refreshToken === "undefined"
    ) {
      return "Unauthorized";
    }

    const newToken = await axios.get(
      process.env.NEXT_PUBLIC_API_URL_DOMAIN +
        "/api/acc/auth/refresh-token?application_token=" +
        process.env.APPLICATION_TOKEN +
        "&access_token=" +
        accessToken +
        "&refresh_token=" +
        refreshToken
    );

    if (newToken && newToken.data && newToken.data.access_token) {
      await store.set("access_token", newToken.data.access_token);
      await store.set("refresh_token", newToken.data.refresh_token);
      await store.set("expires_at", new Date().getTime() + 600 * 1000);
    } else {
      await store.removeItem("access_token");
      await store.removeItem("refresh_token");
      await store.removeItem("expires_at");
      await store.removeItem("currentUserName");
      await store.removeItem("currentUserEmail");
      await store.removeItem("currentUserPicture");
    }
    console.log("token refreshed");
  } catch (error) {
    await store.removeItem("access_token");
    await store.removeItem("refresh_token");
    await store.removeItem("expires_at");
    await store.removeItem("currentUserName");
    await store.removeItem("currentUserEmail");
    await store.removeItem("currentUserPicture");
    console.log(error);

    return "Unauthorized";
  }
  return "Success";
};

const getAccessToken = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let accessToken = null;
  try {
    accessToken = await store.get("access_token");
    const expires_at = await store.getItem("expires_at");
    if (expires_at < new Date().getTime()) {
      await refreshToken();
      accessToken = await store.get("access_token");
    }
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return accessToken || null;
};

const getFolderContents = async (hubId, projectId, path, filterType) => {
  const accessToken = await getAccessToken();
  if (accessToken === null) {
    return null;
  }
  try {
    return (
      await axios(
        process.env.NEXT_PUBLIC_API_URL_DOMAIN +
          "/api/acc/v2/query-project-folder-contents/" +
          hubId +
          "/" +
          projectId +
          "?application_token=" +
          process.env.APPLICATION_TOKEN,
        {
          method: "POST",
          headers: { Authorization: accessToken },
          data: {
            path,
            filterType,
            useCache: false,
          },
        }
      )
    ).data;
  } catch (error) {
    console.log("Error getting folder contents");
    console.log(error);
    return null;
  }
};

const getUserProjects = async (forceRefresh = false) => {
  const accessToken = await getAccessToken();

  let URL =
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
    "/api/acc/v2/projects?application_token=" +
    process.env.APPLICATION_TOKEN;

  if (!forceRefresh) {
    URL += "&useCache=true";
  }

  let userProjects = [];

  try {
    userProjects = (
      await axios.get(URL, {
        headers: { authorization: accessToken },
      })
    ).data;
  } catch (err) {
    console.log("error on getting user projects");
    console.log(err);
    userProjects = [];
  }

  return userProjects;
};

const resetTokenInfo = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.removeItem("access_token");
    await store.removeItem("refresh_token");
    await store.removeItem("expires_at");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

module.exports = {
  setTokenInfo,
  refreshToken,
  getAccessToken,
  getFolderContents,
  getUserProjects,
  resetTokenInfo,
  init,
};
