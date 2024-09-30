const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let count = 0;

async function increment() {
  console.log("Incrementing count...");
  await delay(5000);
  count++;
  console.log(count);
}

function getCount() {
  return count;
}

module.exports = {
  increment,
  getCount,
};
