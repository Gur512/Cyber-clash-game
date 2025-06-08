'use strict';
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//   res.send(`
//     <h1>Welcome to Cyber Clash 🎮</h1>
//     <p>
//       Go to 
//       <a href="/gameplay/index.html">Gameplay</a>, 
//       <a href="/admin/index.html">Admin</a>, or 
//       <a href="/viewing/index.html">Viewing</a>, or
//       <a href="/gameplay/signUp.html">Sign Up</a>
//     </p>
//   `);
// });
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage/home.html'));
});

function getRandomQuestion(callback) {
  db.get(`SELECT * FROM questions ORDER BY RANDOM() LIMIT 1`, [], (err, row) => {
    if (err) {
      console.error("Error fetching question:", err.message);
      console.error("Error fetching question:", err.message);
      callback(null);
    } else {
      callback(row);
    }
  });
}

function getLeaderboard(callback) {
  db.all(`SELECT name, avatar, score FROM players ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching leaderboard:", err.message);
      callback([]);
    } else {
      callback(rows);
    }
  });
}

function emitLeaderboardUpdate() {
  getLeaderboard((leaderboard) => {
    io.emit('leaderboard-update', leaderboard);
  });
}

let currentQuestion = null;  
let gameStatus = 'stopped';  
const playerStates = {};
const viewerPlayers = [];

const players = {}; 
const GAME_DURATION = 60 * 1000; 

io.on('connection', (socket) => {
  console.log(' A user connected:', socket.id);

  socket.emit('gameStatusUpdate', gameStatus);
  if (currentQuestion) {
    socket.emit('new-question', currentQuestion);
  }
  socket.emit('viewer-update-players', viewerPlayers);
  emitLeaderboardUpdate();

  socket.on('startGame', () => {
    console.log('Game started by admin');
    gameStatus = 'started';              
    io.emit('gameStarted');              
    io.emit('gameStatusUpdate', gameStatus); 
  });

  socket.on('pauseGame', () => {
    console.log('Game paused by admin');
    gameStatus = 'paused';               
    io.emit('gamePaused');
    io.emit('gameStatusUpdate', gameStatus);
  });

  socket.on('stopGame', () => {
    console.log('Game stopped by admin');
    gameStatus = 'stopped';              
    currentQuestion = null;              
    io.emit('gameStopped');
    io.emit('gameStatusUpdate', gameStatus);
    io.emit('new-question', null);      
  });

  socket.on('player-join', (data) => {
    let nickname, avatar;

    if (typeof data === 'string') {
      nickname = data;
      avatar = 'user-solid.svg'; 
    } else {
      ({ name: nickname, avatar = 'user-solid.svg' } = data);
    }

    if (!nickname) {                
      socket.emit('player-error', 'Name required');
      return;
    }

    socket.nickname = nickname;
    socket.avatar = avatar;

    const alreadyExists = viewerPlayers.find(p => p.name === nickname);
    if (!alreadyExists) {
      viewerPlayers.push({ name: nickname, avatar }); 
      console.log(`Player joined: ${nickname} with avatar: ${avatar}`);
    }

    io.emit('viewer-update-players', viewerPlayers);

    players[socket.id] = {
      name: nickname,
      avatar,
      joinedAt: Date.now()
    };

    const timer = setTimeout(() => {
      socket.emit("time-up"); 
      delete players[socket.id]; 
      io.emit("player-list", Object.values(players));
    }, GAME_DURATION);

    socket.timer = timer; 

    io.emit("player-list", Object.values(players));
    
    db.run(
      `INSERT OR IGNORE INTO players (name, avatar) VALUES (?, ?)`,
      [nickname, avatar],
      (err) => {
        if (err) {
          console.error('DB insert error:', err.message);
          socket.emit('player-error', 'Database error');
          return;
        }
        console.log('Emitting player join with avatar:', avatar);
        socket.emit('player-joined', { name: nickname, avatar });
        emitLeaderboardUpdate();
        if (currentQuestion) {
          playerStates[nickname] = currentQuestion;
          socket.emit('new-question', currentQuestion);
        } else {
          getRandomQuestion((question) => {
            if (!question) {
              socket.emit('new-question', { question_text: 'No questions available yet!' });
            } else {
              currentQuestion = question;        
              playerStates[nickname] = question;
              socket.emit('new-question', question);
              io.emit('new-question', question); 
            }
          });
        }
      }
    );
  });

  socket.on('submit-answer', ({ nickname, answer }) => {
    const question = playerStates[nickname];
    if (!question || !question.correct_option) {
      socket.emit('error', 'No active question');
      return;
    }

    const correctAnswer = question.correct_option.trim().toLowerCase();
    const userAnswer = answer.trim().toLowerCase();

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      console.log(" Correct answer!");

      db.run(`
        UPDATE players
        SET score = score + 1,
            correct_answer = correct_answer + 1
        WHERE name = ?
      `, [nickname], (err) => {
        if (err) {
          console.error(' Error updating score:', err.message);
        } else {
          console.log(` Score updated for ${nickname}`);
          emitLeaderboardUpdate();
        }
      });

      socket.emit('answer-feedback', {
        correct: true,
        correctAnswer,
        userAnswer
      });


    } else {
      console.log(" Wrong answer");
      socket.emit('answer-feedback', {
        correct: false,
        correctAnswer,
        userAnswer
      });
    }
  });

  socket.on('next-question', () => {
    const nickname = socket.nickname;
    if (!nickname) {
      socket.emit('error', 'No active player session');
      return;
    }

    getRandomQuestion((question) => {
      if (question) {
        playerStates[nickname] = question;
        socket.emit('answer-feedback', { correct: true });
        socket.emit('new-question', question);
        io.emit('new-question', question);
        io.emit('gameStatusUpdate', gameStatus);
      } else {
        socket.emit('error', 'No more questions available');
      }
    });
  });

  socket.on('get-leaderboard', () => {
    console.log(" Fetching leaderboard...");
    getLeaderboard((leaderboard) => {
      socket.emit('leaderboard-update', leaderboard);
    });
  });

  socket.on('disconnect', () => {
    console.log(' A user disconnected:', socket.id);
    if (socket.nickname) {
      const index = viewerPlayers.findIndex(p => p.name === socket.nickname);
      if (index !== -1) viewerPlayers.splice(index, 1);
      io.emit('viewer-update-players', viewerPlayers);
      clearTimeout(socket.timer); 
      delete players[socket.id];  
      io.emit("player-list", Object.values(players)); 
    }
  });
});

server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
setInterval(emitLeaderboardUpdate, 5000);
