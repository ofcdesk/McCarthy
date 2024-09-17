const cron = require("node-cron");
const ftp = require("basic-ftp");

const ftpClient = new ftp.Client();

require("dotenv").config();

async function getCronjobTime() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN +
      "/api/store/get?key=cronjobTime&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const body = await res.text();

  try {
    return body.length > 0 ? body : "*/5 * * * *";
  } catch (e) {
    return "*/5 * * * *";
  }
}

getCronjobTime().then((cronTime) => {
  console.log("Cron time: ", cronTime);
  scheduleTask(cronTime);
});

let currentTask = null;

// Function to create or update the cron job
function scheduleTask(cronTime) {
  if (currentTask) {
    // Stop the existing task if it's running
    currentTask.stop();
  }

  // Schedule the new task
  currentTask = cron.schedule(cronTime, task, {
    scheduled: true,
  });

  console.log(`Scheduled task with cron time: ${cronTime}`);
}

// Example task function to run
function task() {
  console.log("Running task:", new Date());

  fetch(process.env.NEXT_INSTANCE_URL + "/api/acc/runJobs")
    .then((response) => {
      if (response.ok) {
        console.log("Job ran successfully");
      }
    })
    .catch(() => {
      console.error("Error running job");
    });
}

const validateCronTime = (time) => {
  return cron.validate(time);
};

module.exports = {
  validateCronTime,
  scheduleTask,
  ftpClient,
};
