const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");
const {
  setTokenInfo,
  refreshToken,
  getAccessToken,
  getFolderContents,
  getUserProjects,
  resetTokenInfo,
} = require("./src/services/siHubService");
const {
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
} = require("./src/services/storageService");
const lock = require("./src/services/lockService");
const { setCron, stopCron } = require("./src/services/cronService");

module.exports = (phase, { defaultConfig }) => {
  if (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_PRODUCTION_SERVER ||
    phase === PHASE_PRODUCTION_BUILD
  ) {
    return {
      /* development only config options here */
      serverRuntimeConfig: {
        setTokenInfo,
        refreshToken,
        getAccessToken,
        getFolderContents,
        getUserProjects,
        lock,
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
        resetTokenInfo,
        setCron,
        stopCron,
      },
    };
  }

  return nextConfig;
};
