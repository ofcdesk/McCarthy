import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { lock, increment, getCount } = serverRuntimeConfig;

const handler = async (req, res) => {
  const release = await lock.acquire();
  try {
    console.log("API: test");
    await increment();
    res.send(String(getCount()));
  } finally {
    release();
  }
};

export default handler;
