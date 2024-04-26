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

const hostingQueue = new Queue("hosting", options);

const addHosting = (data) => {
  return hostingQueue.createJob(data).save();
};

hostingQueue.on("succeeded", (job) => {
  console.log(`🧾 ${job.data.serverName} ready to be hosting`);
});

getHostingStatus = (id) => {
  return hostingQueue.getJob(id).then((job) => {
    return {
      progress: job.progress,
      status: job.progress == 0 ? "failed" : job.status,
      nginx: job.data,
    };
  });
};

module.exports = {
  addHosting: addHosting,
  getHosting: getHostingStatus,
};
