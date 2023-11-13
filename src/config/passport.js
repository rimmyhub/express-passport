const passport = require("passport");
const User = require("../models/users.model");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;

// req.login(user)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

const localStrategyConfig = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  (email, password, done) => {
    User.findOne({ email: email.toLowerCase() })
      .exec()
      .then((user) => {
        if (!user) {
          return done(null, false, {
            msg: `이메일 ${email}을(를) 찾을 수 없습니다`,
          });
        }

        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            return done(err);
          }

          if (isMatch) {
            return done(null, user);
          }

          return done(null, false, {
            msg: "유효하지 않은 이메일 또는 비밀번호입니다",
          });
        });
      })
      .catch((err) => {
        return done(err);
      });
  }
);

passport.use("local", localStrategyConfig);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 구글에 요청 보내기
const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/auth/google/callback",
    scope: ["email", "profile"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser); // 데이터베이스에 저장
      } else {
        // New user logging in
        const user = new User();
        user.email = profile.emails[0].value;
        user.googleId = profile.id;

        await user.save();
        done(null, user); // 유저 넣어주기
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }
);

passport.use("google", googleStrategyConfig);

const kakaoStrategyConfig = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ kakaoId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      } else {
        const user = new User();
        user.kakaoId = profile.id;
        user.email = profile._json.kakao_account.email;

        await user.save();
        done(null, user);
      }
    } catch (err) {
      done(err);
    }
  }
);

passport.use("kakao", kakaoStrategyConfig);
