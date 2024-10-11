const cron = require("node-cron");
const _store = require("node-persist");
let store = null;
let task = null;

const init = async () => {
  store = _store.create({ dir: "./.node-persist/storage" });
  await store.init();
  console.log("Initializing cronService");

  const syncConfig = await getSynchronizationConfig();
  if (syncConfig !== null && syncConfig !== undefined) {
    console.log(syncConfig);
    //setCron(syncConfig.interval, syncConfig.hour, syncConfig.weekDay);
  }
};

init();
const setCron = (isDaily, hour, weekDay) => {
  task = cron.schedule(
    isDaily ? `0 ${hour} * * *` : `0 ${hour} * * ${weekDay}`,
    async () => {
      console.log("Running cron task");
    }
  );
  console.log("Cron set");
  task.start();
};

const stopCron = () => {
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
