'use strict';

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function isImageFile(file) {
  return file && file.type.startsWith('image');
}

const socket = io(); 
const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
const startBtn = select('.start');
const pauseBtn = select('.pause');
const stopBtn = select('.stop');
const playerName = localStorage.getItem('nickname') || 'Unknown';
const selectedAvatar = localStorage.getItem('profilePic') || 'user-solid.svg'; 

if (playerName && playerName !== 'Unknown') {
  socket.emit('player-join', { name: playerName, avatar: selectedAvatar });
  console.log(`Re-joined as ${playerName} with avatar ${selectedAvatar}`);
}

const playerNameEls = [
  select('.player-one'),
  select('.player-two'),
  select('.player-three')
];
const playerStatusEls = [
  select('.player-one-status'),
  select('.player-two-status'),
  select('.player-three-status')
];
const playerImgEls = [
  select('.player-one-avatar'),
  select('.player-two-avatar'),
  select('.player-three-avatar')
];

socket.on('viewer-update-players', (players) => {
  for (let index = 0; index < playerNameEls.length; index++) {
    const player = players[index];

    if (player) {
      playerNameEls[index].textContent = player.name || "Unnamed";
      playerStatusEls[index].textContent = "Ready";
      playerImgEls[index].src = player.avatar ? `../img/${player.avatar}` : '../img/think.png';
    } else {
      playerNameEls[index].textContent = "Not-joined";
      playerStatusEls[index].textContent = "Not-Ready";
      playerImgEls[index].src = '../img/think.png'; 
    }
  }
});

listen('click', startBtn, () => {
  socket.emit('startGame');
});

listen('click', pauseBtn, () => {
  socket.emit('pauseGame');
});

listen('click', stopBtn, () => {
  socket.emit('stopGame');
});

socket.emit('get-leaderboard');

socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
  updateLobbyPlayers(players);  
});

socket.on('new-question', (question) => {
  const questionText = select('#question-text');
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
  }
});

function updateLeaderboard(players) {
  const leaderboard = select('#leaderboard');
  leaderboard.innerHTML = ''; 

  players.sort((a, b) => b.score - a.score);
  players.forEach((p, i) => {
    const div = document.createElement('div');
    div.innerHTML =
      `<img src="../img/${p.avatar}">
       ${i+1}. ${p.name} – ${p.score} pts`;
    leaderboard.appendChild(div);
  });
}

listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});
