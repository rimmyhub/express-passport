const express = require("express");
const usersRouter = express.Router();
const passport = require("passport");
const sendMail = require("../mail/goodbye_template");

// 로그인
// 미들웨어 안에 미들웨이 호출
usersRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ msg: info });
    }

    req.logIn(user, function (err) {
      if (err) return next(err);
      res.redirect("/");
    });
  })(req, res, next);
});

// 로그아웃
usersRouter.post("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// 회원 가입
// 회원 가입할때 환영합니다 해주기
usersRouter.post("/signup", async (req, res) => {
  //user 객체를 생성합니다
  const user = new User(req.body);

  //user 컬렉션에 유저를 저장합니다
  try {
    await user.save();

    // 이메일 보내기
    sendMail("kjh878@naver.com", "혜림", "welcome");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
  }
});

//구글에 요청 보내기
usersRouter.get("/google", passport.authenticate("google"));

usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

usersRouter.get("/kakao", passport.authenticate("kakao"));

usersRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = usersRouter;
