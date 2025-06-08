'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io(); 
console.log('Nickname:', localStorage.getItem('nickname'));
console.log('Avatar:', localStorage.getItem('profilePic'));
const questionText = document.getElementById('question-text');
const leaderboard = document.getElementById('leaderboard');

const playerName = localStorage.getItem('nickname') || 'Unknown';
const selectedAvatar = localStorage.getItem('profilePic') || 'user-solid.svg'; 
if (playerName && playerName !== 'Unknown') {
  socket.emit('player-join', { name: playerName, avatar: selectedAvatar });
  console.log(`Viewer re-joined as ${playerName} with avatar ${selectedAvatar}`);
}

console.log('Emitting player-join with:', {
  name: localStorage.getItem('nickname'),
  avatar: localStorage.getItem('profilePic')
});

socket.on('leaderboard-data', (data) => {
  updateLeaderboardUI(data); 
});

setInterval(() => {
  socket.emit('request-leaderboard');
}, 5000); 

function updateLeaderboardUI(data) {
  const highScoresList = document.querySelector('.high-scores');
  highScoresList.innerHTML = ""; 

  data.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.name} - ${player.score}`;
    highScoresList.appendChild(li);
  });

  const fixedSlots = document.querySelectorAll('.current-scores > div');
  fixedSlots.forEach((slot, i) => {
    if (data[i]) {
      slot.querySelector('h4').textContent = data[i].name;
      slot.querySelector('p').textContent = `Score: ${data[i].score}`;
    } else {
      slot.querySelector('h4').textContent = "";
      slot.querySelector('p').textContent = "";
    }
  });
}

socket.emit('get-leaderboard');

socket.on('leaderboard-update', (players) => {
  console.log('🏆 Received leaderboard update:', players);
  updateLeaderboard(players);
});

socket.on('viewer-update-players', (players) => {
  const playerNameEls = [
    document.querySelector('.player-one'),
    document.querySelector('.player-two'),
    document.querySelector('.player-three')
  ];
  const playerStatusEls = [
    document.querySelector('.player-one-status'),
    document.querySelector('.player-two-status'),
    document.querySelector('.player-three-status')
  ];
  const playerImgEls = [
    document.querySelector('.player-one-avatar'),
    document.querySelector('.player-two-avatar'),
    document.querySelector('.player-three-avatar')
  ];

  players.forEach((player, index) => {
    console.log("Rendering player:", player.name, "Avatar:", player.avatar);
    if (playerNameEls[index]) {
      playerNameEls[index].textContent = player.name || "Unnamed";
      playerStatusEls[index].textContent = "Ready";

      if (player.avatar) {
        playerImgEls[index].src = `../img/${player.avatar}`;
        console.log("Image source set to:", playerImgEls[index].src);
      } else {
        playerImgEls[index].src = '/img/user-solid.svg';
      }
      console.log(`✅ Player ${index + 1} => Name: ${player.name}, Avatar: ${player.avatar}`);
    }
  });
});


socket.on('new-question', (question) => {
  if (questionText && question && question.question_text) {
    questionText.textContent = question.question_text;
  } else {
    questionText.textContent = 'No questions available';
  }
});

socket.emit('get-question');

socket.on('new-question', (question) => {
  console.log("🟢 New Question Received:", question);
  document.querySelector('.question-text').innerText = question.question_text;
  document.querySelector('.opt-one-txt').innerText = question.option_a;
  document.querySelector('.opt-two-txt').innerText = question.option_b;
  document.querySelector('.opt-three-txt').innerText = question.option_c;
  document.querySelector('.opt-four-txt').innerText = question.option_d;
});

function updateLeaderboard(players) {
  leaderboard.innerHTML = ''; 

  players.sort((a, b) => b.score - a.score);

  players.forEach((p, i) => {
   const div = document.createElement('div');
    div.innerHTML =
      `<img src="../img/${p.avatar}" alt="${p.name}" class="leaderboard-avatar">
      ${i+1}. ${p.name} – ${p.score} pts`;
    leaderboard.appendChild(div);
  });
}

const scoreTrigger = select('.score-trigger');
const scoreDisplay = select('.score-display');
listen("click", scoreTrigger, () =>{
  scoreDisplay.classList.toggle('open');
});
