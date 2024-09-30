const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");
const { increment, getCount } = require("./src/services/siHubService");
const lock = require("./src/services/lockService");

module.exports = (phase, { defaultConfig }) => {
  if (
    phase === PHASE_DEVELOPMENT_SERVER ||
    phase === PHASE_PRODUCTION_SERVER ||
    phase === PHASE_PRODUCTION_BUILD
  ) {
    return {
      /* development only config options here */
      serverRuntimeConfig: {
        increment,
        getCount,
        lock,
      },
    };
  }

  return nextConfig;
};
