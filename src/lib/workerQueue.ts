import { Connection } from "@/pages";
import async from "async";

const concurrency = 2; // Adjust this value as needed

type ConnectionTask = Connection & { name: string };

export const connectionQueue = async.queue(function (
  task: ConnectionTask,
  callback
) {
  processTask(task)
    .then(() => callback())
    .catch(callback);
},
concurrency);

async function processTask(task: ConnectionTask) {
  console.log("WORKER 1: Connection to be made", task);
  //   console.log(`Processing task: ${task}`);
}

connectionQueue.drain(() => {
  console.log("All tasks have been processed");
});

connectionQueue.error((err, task) => {
  console.error(`Error processing task ${task.name}:`, err);
});
