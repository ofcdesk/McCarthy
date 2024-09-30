module.exports = {
  apps: [
    {
      name: "Besco-Backend",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./",
    },
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: "nicolas",
      host: ["raci-ssoma.besco.com.pe"],
      key: "C:/Users/Nicolas/.ssh/id_rsa",
      ref: "origin/main",
      repo: "git@github.com:ofcdesk/besco-backend.git",
      path: "~/apps",
      "post-deploy":
        "pm2 stop Besco-Backend; npm install; npm run build --max_old_space_size=2048 ; pm2 start Besco-Backend --time",
    },
  },
};
