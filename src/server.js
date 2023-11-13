const express = require("express");
const path = require("path");
const { default: mongoose } = require("mongoose");
const app = express();
const User = require("./models/users.model");

const config = require("config");
const serverConfig = config.get("server");

const port = serverConfig.port;

const passport = require("passport");
const cookieSession = require("cookie-session");
const mainRouter = require("./routers/main.router");
const usersRouter = require("./routers/users.router");

require("dotenv").config();

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY;

app.use(
  cookieSession({
    name: "cookie-session-name",
    keys: [cookieEncryptionKey],
  })
);

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      {
        cb();
      }
    };
  }

  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//ejs연결하기
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//몽구스 연결하기
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/", mainRouter);
app.use("/auth", usersRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
