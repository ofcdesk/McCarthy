const StorageService = require("../services/storageService");

const init = async () => {
  await StorageService.init();
  const ftpConfig = await StorageService.getFtpConfig();
  console.log(ftpConfig);

  console.log(process.env.NEXT_PUBLIC_API_URL_DOMAIN);
};

init();

process.stdin.on("data", (data) => {
  console.log(`Received from parent: ${JSON.parse(data).text}`);
});
