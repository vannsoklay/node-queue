const { default: axios } = require("axios");
const Queue = require("bee-queue");

const hostingQueue = new Queue("hosting");

hostingQueue.process(3, (job, done) => {
  // ****** processing [hosting] ******* //
  setTimeout(() => console.log("Get start to be hosting"), 1000);

  // ****** processing [prepare] ******* //
  setTimeout(() => {
    console.log(
      `Preparing for to be hosting this domain: ${job.data.serverName}`
    );
    // job.reportProgress(10);
  }, 1500);

  let status = "process";
  //   axios
  //     .post(`https://backend.riverbase.org/nginx/add?cloudflare=${true}`, {
  //       server_name: job.data.serverName,
  //       target_site: [`http://localhost:${job.data.port}`],
  //       feature: "Proxy",
  //     })
  //     .then((_) => {
  //       status = "done";
  //       return;
  //     })
  //     .catch((_) => {
  //       status = "error";
  //       return;
  //     });
  //   const addNginx = (serverName) => {
  //     axios.get()
  //   }
  let timer = setInterval(() => {
    axios
      .get(
        `https://backend.riverbase.org/hosting/logger/${job.data.serverName}`
      )
      .then((response) => {
        job.reportProgress(40);
        if (response.data.code === 200) {
          axios
            .get(
              `https://backend.riverbase.org/hosting/port/${job.data.serverName}`
            )
            .then((host) => {
              job.reportProgress(60);
              console.log("host", host.data.message);
            });
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
    // if (status === "done") {
    //   clearInterval(timer);
    //   console.log(`Progress job:${job.id}: ........ done`);
    //   job.reportProgress(100);
    //   done();
    //   return;
    // } else if (status === "error") {
    //   clearInterval(timer);
    //   console.log(`Progress job:${job.id}: ...... stop`);
    //   job.reportProgress(0);
    //   return;
    // }
    // console.log(`Running: .......${job.id}`);
  }, 4000);
});
