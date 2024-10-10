const _store = require("node-persist");
let store = null;

const init = async () => {
  store = _store.create({ dir: "./.node-persist/storage" });
  await store.init();
  console.log("Initializing storageService");
};

init();

let LOCK = false;

const getFileSyncStatus = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let syncStatus = null;
  try {
    syncStatus = await store.get("currentSyncFile");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return syncStatus;
};

const setFileSyncStatus = async (file, status, error, uploadCompleted) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem("currentSyncFile", {
      file,
      status,
      error,
      uploadCompleted,
    });
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const getSyncStatus = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let syncStatus = null;
  try {
    syncStatus = await store.get("syncStatus");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return syncStatus;
};

const setSyncStatus = async (status, lastDate) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem("syncStatus", {
      status,
      lastDate,
    });
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const setCurrentUser = async (name, email, picture) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem("currentUser", {
      name,
      email,
      picture,
    });
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const getCurrentUser = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let user = null;
  try {
    user = await store.get("currentUser");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return user;
};

const getSynchronizationConfig = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let syncConfig = null;
  try {
    syncConfig = await store.get("synchronizationConfig");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return syncConfig;
};

const setSynchronizationConfig = async (
  hubId,
  projectId,
  projectName,
  accFolderPath,
  ftpFolderPath,
  interval,
  weekDay,
  hour
) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem("synchronizationConfig", {
      hubId,
      projectId,
      projectName,
      accFolderPath,
      ftpFolderPath,
      interval,
      weekDay,
      hour,
    });
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const setFtpConfig = async (host, user, password, secure, port) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem("ftpConfig", {
      host,
      user,
      password,
      secure,
      port,
    });
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const getFtpConfig = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let ftpConfig = null;
  try {
    ftpConfig = await store.get("ftpConfig");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return ftpConfig;
};

const reset = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.clear();
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const resetFtpConfig = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.removeItem("ftpConfig");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const resetSyncStatus = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.removeItem("syncStatus");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const resetCurrentUser = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.removeItem("currentUser");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const resetSynchronizationConfig = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.removeItem("synchronizationConfig");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const setLastSyncTime = async (lastTime) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.set("syncLastTime", lastTime);
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const getLastSyncTime = async () => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let lastTime = null;
  try {
    lastTime = await store.get("syncLastTime");
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return lastTime;
};

const setFileLastDate = async (file, lastDate) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  try {
    await store.setItem(file, lastDate);
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
};

const getFileLastDate = async (file) => {
  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  LOCK = true;
  let lastDate = null;
  try {
    lastDate = await store.get(file);
  } catch (error) {
    console.log(error);
  }
  LOCK = false;
  return lastDate;
};

module.exports = {
  getFileSyncStatus,
  setFileSyncStatus,
  getSyncStatus,
  setSyncStatus,
  setCurrentUser,
  getCurrentUser,
  getSynchronizationConfig,
  setSynchronizationConfig,
  setFtpConfig,
  getFtpConfig,
  reset,
  resetFtpConfig,
  resetSyncStatus,
  resetCurrentUser,
  resetSynchronizationConfig,
  setLastSyncTime,
  getLastSyncTime,
  init,
  setFileLastDate,
  getFileLastDate,
};
