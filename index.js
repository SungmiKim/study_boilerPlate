const express = require("express");
const app = express();
const port = 5000;
const { User } = require("./models/User");

const config = require("./config/key");

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

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

// 포트 설정
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
