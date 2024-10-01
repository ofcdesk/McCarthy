module.exports = {
  apps: [
    {
      name: "McCarthy-Backend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./",
    },
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: "ec2-user",
      host: ["52.54.70.255"],
      key: "./mccarthy-backend.pem",
      ref: "origin/main",
      repo: "git@github.com:ofcdesk/McCarthy.git",
      path: "~/apps",
      "post-deploy":
        "pm2 stop McCarthy-Backend; yarn; yarn build --max_old_space_size=2048 ; pm2 start McCarthy-Backend --time",
    },
  },
};
