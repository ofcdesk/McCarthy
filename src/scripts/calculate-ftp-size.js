const { Client } = require("basic-ftp");

const _calculateSize = async (client, initialPath = "") => {
  let totalSize = 0;
  const stack = [initialPath];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (currentPath.length > 0) {
      await client.cd(currentPath);
    }
    const list = await client.list();

    for (const item of list) {
      if (item.isDirectory) {
        stack.push(`${currentPath}/${item.name}`);
      } else {
        totalSize += item.size;
      }
    }
    console.log(totalSize / 1048576 / 1000); // Log the size in MB
  }

  return totalSize;
};

const exec = async (req, res) => {
  const client = new Client();
  client.availableListCommands = ["LIST"];
  client.ftp.verbose = true;

  await client.access({});

  try {
    const totalSize = await _calculateSize(client, "");
    res.send({ totalSize: totalSize / 1048576 / 1000 });
  } catch (err) {
    console.log("Read permission denied or error:", err);
  } finally {
    client.close();
  }
};

exec();
