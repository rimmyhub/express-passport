const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    minLength: 5,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  kakaoId: {
    type: String,
    unique: true,
    sparse: true,
  },
});

// 해시화하기
const saltRounds = 10;
userSchema.pre("save", function (next) {
  let user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// 로그인할때 새롭게 해쉬된 비밀번호를 만들어서 비교를 해줍니다
userSchema.methods.comparePassword = function (plainPassword, cb) {
  // bcrypt compare비교
  // plain password => client, this.password => 데이터베이스에 있는 비밀번호
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cd(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
