import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { lock, increment, getCount } = serverRuntimeConfig;
//import { spawn  } from "child_process";

const handler = async (req, res) => {
  const release = await lock.acquire();
  try {
    /**const worker = new Worker(__filename);
    worker.on('message', (msg) => console.log(`Received from worker: ${msg}`));
    worker.postMessage('Hello, worker!');*/
    console.log("API: test");
    await increment();
    res.send(String(getCount()));
  } finally {
    release();
  }
};

export default handler;
