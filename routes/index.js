/**
 * 설치
 * express --view=ejs
 * npm install
 */


var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/* GET home page. */
// 글 조회하기
router.get('/', async (req, res, next) => {
/**
 * get 과 post의 차이
 * GET: 클라이언트에서 서버로 어떠한 리소스로 부터 정보를 '요청'하기 위해 사용 - 읽거나 검색할 때 사용
 * POST: 리소스를 생성/업데이트하기 위해 서버에 데이터를 보내는 데 사용
 */
  const data = await pool.query("select * from post;");
  console.log(data[0]);
  let resultData = data[0];

  res.render('index', { title: 'Express', data: resultData });
  /**
  * render: 해당 페이지를 불러올 때 사용, {} -> 데이터를 담을 수 있음
  * { data : data }
  */
});

// 글 작성하기 - create
router.get("/write", async(req, res, next) => {
  res.render("post_create", {});
});

router.post("/write", async(req,res, next) => {
  /**
   * await: 비동기 선언
   * function: 동기적 통신 -> 요청 후 대기
   * async: 비동기적 통신 -> 요청 후에도 다른일을 처리함
   * node js는 비동기적 통신을 사용
   */
  const{ title, content } = req.body;
  console.log( "제목: ", title, "내용: ", content );
  const date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth()+1;
  let day = date.getDate();
  let totalDate = year + "-" + month + "-" + day;

  const insertData = await pool.query(
    "insert into post values (null, ?, ?, ?, ?, ?)",
    [title, content, null, totalDate, 0]
  );
  /**
   * [table]
   * id: PK(Primary Key 식별자), Auto Increment(자동 증가)
   * title: 제목
   * content: 글 내용
   * writer: 작성자
   * create_date: 작성날짜
   * views: 조회수
   */

  return res.send(
    `<script type = "text/javascript">alert("글 작성이 완료되었습니다."); location.href = "/"; </script>`
  );
});

// 검색하기 
router.get('/search', async(req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const data = await pool.query("select * from post where title like ?", [`%${searchTerm}%`]);
  console.log("검색어: ", searchTerm, "검색 결과: ", data[0]);

  res.render("index", {data: data[0]});
})

// 상세페이지 로드
router.get("/detail/:id", async(req, res, next) => {
  const id = req.params.id;

  const data = await pool.query("select * from post where id = ?", [id]);

  // 조회수
  const updateViews = await pool.query("update post set views = views + 1 where id = ?", [id]);

  // 댓글 조회
  const commentdata = await pool.query("select * from comment where post_id = ?", [id]);

  console.log(data[0]);

  res.render("post_detail", {data: data[0][0], commentdata: commentdata[0]});

});

// 글 수정하기 페이지
router.post("/update/:id", async(req, res, next) => {
  const id = req.params.id;
  const updatePost = await pool.query("select * from post where id = ?", [id]);
  return res.render("post_update", {data: updatePost[0][0]});
});

// 글 수정하기 - update
router.post("/update", async(req, res, next) => {
  const {id, title, content} = req.body;
  console.log("!!!", typeof(id), typeof(title), typeof(content));
  const updateFinishPost = await pool.query("update post set title = ?, content = ? where id = ?", [title, content, id]);

  return res.send(`<script type = "text/javascript">alert("글 수정이 완료되었습니다."); location.href = "/";</script>`);
});

// 수정 취소하기
router.get("/back", async(req, res, next) => {
  res.send(`<script type = "text/javascript">window.history.go(-2);</script>`)
})

//글 삭제하기 - delete
router.get("/delete/:id", async(req, res, next) => {
  const id = req.params.id;
  console.log("글 삭제: ", id);

  const deletePost = await pool.query("delete from post where id = ?;", [id]);

  return res.send(
    `<script type = "text/javascript"> alert("글이 삭제 되었습니다."); location.href="/"; </script>`
  );
});

// 댓글 작성하기
router.post("/detail/:id/comments", async(req, res, next) => {
  const postId = req.params.id;
  const { comment } = req.body;
  const date = new Date();
  console.log("댓글: ", comment)

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let comment_date = year + "-" + month + "-" + day;

  const insertComment = await pool.query(
    "insert into comment values (null, ?, ?, ?)",
    [postId, comment, comment_date]
  );

  return res.send(
    `<script type="text/javascript">alert("댓글 작성이 완료되었습니다."); location.href = "/detail/${postId}"; </script>`
  );
});

//댓글 삭제하기
router.get("/detail/:id/comments/:commentId/delete", async(req, res, next) => {
  const commentId = req.params.commentId;
  const postId = req.params.id;
  console.log("댓글 삭제: ", commentId);

  const deleteComment = await pool.query("delete from comment where id = ?;", [commentId]);

  return res.send(
    `<script type = "text/javascript"> alert("댓글이 삭제 되었습니다."); location.href="/detail/${postId}"; </script>`
  );
})

module.exports = router;
