#McCarthy Dashboard

This is a [Next.js](https://nextjs.org/) project, hosted in Azure.

## Getting Started

Run the server:

```bash
pm2 start webserver
```

Deploying updates:

```
pm2 deploy production
```

Check Web Server App Status and Logs:

```
pm2 status
pm2 show webserver
pm2 logs webserver
pm2 monit
```

Run a command directly on webserver:

```
pm2 deploy production exec "example_command"
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation and Dependencies:

- [Next.js](https://nextjs.org/) - Application framework.
- [Next.js Documentation](https://nextjs.org/docs) - Application framework documentation.
- [React, React-Dom](https://reactjs.org/) - Application framework.
- [React Documentation](https://reactjs.org/docs/getting-started.html) - Application framework documentation.
- [Axios](https://github.com/axios/axios) - Web Module.
- [Node-Persist](https://github.com/simonlast/node-persist) - For Cache.
- [Yup](https://github.com/jquense/yup) - For runtime value parsing and validation.
- [Uuid](https://github.com/uuidjs/uuid) - For the creation of RFC4122 UUIDs.
- [SimpleBar](https://grsmto.github.io/simplebar/) - Replace the browser's default scrollbar with a custom CSS-styled one without losing performances.
- [react-dropzone](https://github.com/react-dropzone/react-dropzone) - Simple React hook to create a HTML5-compliant drag'n'drop zone for files.
- [nprogress](https://github.com/rstacruz/nprogress) - Slim progress bars.
- [notistack](https://www.notistack.com) - Highly customizable notification snackbars (toasts) that can be stacked on top of each other.
- [merge](https://github.com/yeikos/js.merge) - (recursive)? merging of (cloned)? objects.
- [iron-session](https://github.com/vvo/iron-session#readme) - Node.js stateless session utility using signed and encrypted cookies to store data. Works with Next.js, Express, NestJs, Fastify, and any Node.js HTTP framework.
- [formik](https://formik.org) - Build forms in React, without the tears.
- [date-fns](https://github.com/date-fns/date-fns#readme) - Modern JavaScript date utility library.
- [clsx](https://github.com/lukeed/clsx#readme) - A tiny (228B) utility for constructing className strings conditionally.
- [@mui/material](https://mui.com/material-ui/getting-started/overview/) - React components that implement Google's Material Design.
- [@mui/icons-material](https://mui.com/material-ui/material-icons/) - Material Design icons distributed as SVG React components.
- [@emotion](https://github.com/emotion-js/emotion/tree/main#readme) - styled API for emotion (MaterialUI dependency).

## External Tools:

- [PM2](https://pm2.keymetrics.io/) - Node.js Process Manager and Remote deployment Tool.
- [Nginx](https://nginx.org/en/) - HTTP and reverse proxy server.

## First Setup:

• Connect to Ec2-Instance<br />
• Install NodeJs (LTS version)<br />
• Install PM2<br />
• Install and Configure Nginx or Apache<br />
• Grant permissions to GIT clone the target repository<br />
• Run "pm2 startup" and follow the setup instructions<br />
• Go back to local machine and Run "pm2 deploy production setup"<br />
• Connect to Ec2-Instance again<br />
• Go to ~/apps/current and run "npm install"<br />
• Run "npm run build"<br />
• Run "pm2 start"<br />
• Run "pm2 save"<br />
• Go back to local machine and test the deployment with "pm2 deploy production"<br />

## To Enable HTTPS:

• Connect to Ec2-Instance<br />
• Install and Configure Certbot and respective plugin for Nginx or Apache<br />
• Run Certbot and get the certificates<br />
• Configure Nginx or Apache to use the certificates<br />

## Remote Monitorate the server with web interface:

• Connect to Ec2-Instance<br />
• Register and follow the instructions in [PM2.IO](https://app.pm2.io/)<br />

Nginx Commands:

```
sudo vim /etc/nginx/nginx.conf
sudo service nginx restart
sudo certbot --nginx
```

The `examples-files` folder contains examples of files required to do setup or additional setup
