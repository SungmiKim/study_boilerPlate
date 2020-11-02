const express = require("express");
const app = express();
const port = 5000;
const { User } = require("./models/User");
const config = require("./config/key");

// 쿠키 설정
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// body-parser 설정
const bodyParser = require("body-parser");

// application/x-www-form-urlencoded로 된 정보를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));
// application/json으로 된 정보를 분석해서 가져옴
app.use(bodyParser.json());

// MongoDB 연결
const mongoose = require("mongoose");
const { application } = require("express");

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// 메인 페이지 route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 회원 등록 페이지 route
app.post("/register", (req, res) => {
  // 회원가입 할 때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터베이스에 넣어준다.

  const user = new User(req.body);

  // ./model/User.js의 userSchema.pre function 동작 후 실행
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

// 로그인 페이지 route
app.post("/login", (req, res) => {
  // 1. 데이터 베이스에서 요청한 E-mail 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    // 2. 데이터 베이스에서 요청한 E-mail이 있다면 비밀번호가 같은지 확인
    //   ./model/User.js에서 만든 method 호출
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      // 3. 비밀 번호까지 같다면 Token을 생성
      //   ./model/User.js에서 만든 method 호출
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //   토큰을 저장한다. 쿠키, 로컬스토리지, 세션 등등 여러가지 방법이 있다.
        //   -> 쿠키에 저장
        res.cookie("x_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

// 포트 설정
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
