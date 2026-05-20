const express = require('express');
const oracledb = require('oracledb');
const path = require('path');
const app = express();
const port = 3000;

// JSON 및 Form 데이터 파싱 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 [수정 완료] 인스턴트 클라이언트 라이브러리 경로(libDir)와 전자 지갑 경로(configDir) 동시 지정
oracledb.initOracleClient({ 
  libDir: '/opt/oracle/instantclient_21_21',
  configDir: path.join(__dirname, 'wallet') 
});

// DB 접속 정보 설정
const dbConfig = {
  user: 'ADMIN',
  password: 'js@25509562', // 💡여기에 본인의 실제 비밀번호를 입력하세요!
  connectString: 'tboard_low'               // tnsnames.ora 파일에 정의된 접속 이름
};

// 메인 화면 (index.html 제공)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🚀 3단계 목표: 게시판 목록 조회 API (TEST)
app.get('/api/board', async (req, res) => {
  let connection;
  try {
    // DB 연결
    connection = await oracledb.getConnection(dbConfig);
    
    // 게시글 조회 쿼리 실행
    const result = await connection.execute(
      `SELECT id, title, content, image_path, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at 
       FROM board 
       ORDER BY id DESC`,
      [], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 결과를 객체 배열 형태로 받아옴
    );
    
    // 결과 전송
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '데이터베이스 조회 실패' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
