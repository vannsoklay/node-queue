require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const allowedOrigins = ["http://localhost:3000"];

require("./nginx");
require("./controller/hosting");
const { getStatus, placeNginx } = require("./waiter");
const { getHosting, addHosting } = require("./queue/hosting");

// Inits
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Routes
app.get("/", (req, res) => {
  res.send("😋 We are hosting");
});

app.post("/nginx/add", (req, res) => {
  let host = {
    serverName: req.body.serverName,
    port: req.body.port,
  };

  if (host.serverName && host.port) {
    placeNginx(host)
      .then((job) =>
        res.json({
          done: true,
          job: job.id,
          message: "success",
        })
      )
      .catch(() =>
        res.json({
          done: false,
          message: "failed",
        })
      );
  } else {
    res.status(422);
  }
});

app.post("/hosting", (req, res) => {
  let body = {
    serverName: req.body.serverName
  };

  if (body.serverName) {
    addHosting(body)
      .then((job) =>
        res.json({
          done: true,
          job: job.id,
          message: "success",
        })
      )
      .catch(() =>
        res.json({
          done: false,
          message: "failed",
        })
      );
  } else {
    res.status(422);
  }
});

app.get("/host/:id", (req, res) => {
  let id = req.params.id;
  if (!id) {
    res.sendStatus(400);
    return;
  }

  getHosting(id)
    .then((result) => {
      res.json({
        progress: result.status == "succeeded" ? 100 : result.progress,
        nginx: result.nginx,
        status: result.status,
      });
    })
    .catch((_) => {
      res.sendStatus(500);
    });
});

// Create and start the server
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Queue open at:${PORT}`);
});
