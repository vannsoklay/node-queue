const { default: axios } = require("axios");
const Queue = require("bee-queue");

const nginxQueue = new Queue("nginx");

nginxQueue.process(3, (job, done) => {
  setTimeout(() => console.log("Getting the ingredients ready"), 1000);

  setTimeout(() => {
    console.log(
      `Preparing ${job.data.serverName}-::http://localhost:${job.data.port}`
    );
    job.reportProgress(10);
  }, 1500);

  let status = "process";
  axios
    .post(`https://backend.riverbase.org/nginx/add?cloudflare=${true}`, {
      server_name: job.data.serverName,
      target_site: [`http://localhost:${job.data.port}`],
      feature: "Proxy",
    })
    .then((_) => {
      status = "done";
      return;
    })
    .catch((_) => {
      status = "error";
      return;
    });

  let timer = setInterval(() => {
    if (status === "done") {
      clearInterval(timer);
      console.log(`Progress job:${job.id}: ........ done`);
      job.reportProgress(100);
      done();
      return;
    } else if (status === "error") {
      clearInterval(timer);
      console.log(`Progress job:${job.id}: ...... stop`);
      done();
      return;
    }
    console.log(`Running: .......${job.id}`);
  }, 4000);
});
