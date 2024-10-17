const cron = require("node-cron");
const _store = require("node-persist");
let store = null;
let task = null;

const convertTo24HourFormat = (time) => {
  const [hour, period] = time.split(" ");
  let hour24 = parseInt(hour, 10);

  if (period.toUpperCase() === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period.toUpperCase() === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return hour24;
};

const init = async () => {
  store = _store.create({ dir: "./.node-persist/storage" });
  await store.init();
  console.log("Initializing cronService");

  const syncConfig = await getSynchronizationConfig();
  console.log(syncConfig);
  if (syncConfig !== null && syncConfig !== undefined) {
    setCron(
      syncConfig.interval === "DAILY",
      syncConfig.hour,
      syncConfig.weekDay
    );
  }
};

init();
const setCron = (isDaily, _hour, weekDay) => {
  const hour = convertTo24HourFormat(_hour);
  task = cron.schedule(
    isDaily ? `0 ${hour} * * *` : `0 ${hour} * * ${weekDay}`,
    async () => {
      console.log("Running cron task");
      const syncConfig = await getSynchronizationConfig();
      console.log(syncConfig);
      await setFileSyncStatus(
        syncConfig.ftpFolderPath.id,
        "Starting sync",
        false,
        false
      );

      const child = spawn("node", [
        "./src/scripts/scheduled-synchronization.js",
      ]); // Run an external script
      child.stdin.write(
        JSON.stringify({
          hubId: syncConfig.hubId,
          projectId: syncConfig.projectId,
          accPath: syncConfig.accFolderPath.id,
          ftpPath: syncConfig.ftpFolderPath.id,
          accFolderId: syncConfig.accFolderPath.accId,
        })
      );
      child.stdin.end();

      child.stdout.on("data", (data) => {
        console.log(`Main Child stdout: ${data}`);
      });

      child.stderr.on("data", (data) => {
        console.error(`Main Child stderr: ${data}`);
      });

      child.on("close", (code) => {
        console.log(`Main Child process exited with code ${code}`);
      });
    }
  );
  console.log("Cron set");
  task.start();
};

const stopCron = () => {
  console.log("Stopping cron");
  task.stop();
};

const getSynchronizationConfig = async () => {
  let syncConfig = null;
  try {
    syncConfig = await store.get("synchronizationConfig");
  } catch (error) {
    console.log(error);
  }
  return syncConfig;
};

module.exports = {
  setCron,
  stopCron,
};
