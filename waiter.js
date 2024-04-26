const Queue = require("bee-queue");

const options = {
  isWorker: false,
  sendEvents: false,
  redis: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
  },
};

const nginxQueue = new Queue("nginx", options);

const placeNginx = (nginx) => {
  return nginxQueue.createJob(nginx).save();
};

nginxQueue.on("succeeded", (job) => {
  console.log(`🧾 ${job.data.serverName}x ${job.data.port} ready to be served`);
});

getNginxStatus = (nginxId) => {
  return nginxQueue.getJob(nginxId).then((job) => {
    return {
      progress: job.progress,
      status: job.progress == 0 ? "failed" : job.status,
      nginx: job.data,
    };
  });
};

module.exports = {
  placeNginx: placeNginx,
  getStatus: getNginxStatus,
};
