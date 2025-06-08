'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io(); 
const mcqWrapper = document.querySelector('.multiple-choice-wrapper');
const tfWrapper = document.querySelector('.true-false-wrapper');
const questiontxt =  document.querySelector('.question-text');
const allQuestype = document.querySelectorAll('.multiple-choice div, .true-false div');
const selectedElements = document.querySelectorAll('.selected');
const submitBtn = document.querySelector('.submit');
const pauseMsg = document.getElementById('pauseMessage');
const StopMsg = document.querySelector('.StopMsg');
const quesDisplay = document.querySelector('.question-display');
const warningMsg = document.querySelector(".warning-msg");

let nickname = localStorage.getItem('nickname') || "";
let selectedavtar = localStorage.getItem('profilePic') || 'user.solid.png';

let countdown = 60;
const countdownEl = document.getElementById("countdown");

const countdownInterval = setInterval(() => {
  countdown--;
  countdownEl.textContent = `${countdown}s`;

  if (countdown <= 0) {
    clearInterval(countdownInterval);
  }
}, 1000);

socket.on("time-up", () => {
  quesDisplay.style.display = 'none';
  StopMsg.style.display = 'block';
  StopMsg.innerText = "⏰ Time’s up! Thanks for playing.";
  setTimeout(() => {
      window.location.href = '../viewing/index.html';
  }, 5000);
});

if (!nickname) {
  alert("Please sign up first to set your nickname!");
  window.location.href = "./signUp.html";
} else {
  console.log(" Nickname fetched from localStorage:", nickname);
  socket.emit('player-join', {               
    name: nickname,
    avatar : selectedavtar
  });

  socket.on('gameStarted', () => {
    console.log('Game started!');
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = '#c2cfa4';
    pauseMsg.style.display = 'none';
    allQuestype.forEach(option => option.style.pointerEvents = 'auto');
  });

  socket.on('gamePaused', () => {
    console.log('Game paused!');
    submitBtn.disabled = true;
    pauseMsg.style.display = 'block';
    allQuestype.forEach(option => option.style.pointerEvents = 'none');
  });

  socket.on('gameStopped', () => {
    console.log('Game stopped!');
    submitBtn.disabled = true;
    pauseMsg.style.display = 'none';
    quesDisplay.style.display = 'none';
    StopMsg.style.display = 'block';
    StopMsg.innerText = "Quiz Stopped! Thank you for Playing &#128522;";
    allQuestype.forEach(option => option.style.pointerEvents = 'none');
    setTimeout(() => {
      window.location.href = '../viewing/index.html';
    }, 5000); 
  });
}

socket.on('new-question', (question) => {
  console.log(" New Question Received:", question);
  selectedElements.forEach(el => el.classList.remove('selected', 'wrong', 'correct'));
  selectedAnswer = null;
  questiontxt.innerText = question.question_text;

  if (question.question_type === 'tf') {
    mcqWrapper.style.display = 'none';
    tfWrapper.style.display = 'block';
    document.querySelector('.opt-one-txt').innerText = question.option_a;
    document.querySelector('.opt-two-txt').innerText = question.option_b;
  } else {
    tfWrapper.style.display = 'none';
    mcqWrapper.style.display = 'block';
    document.querySelector('.opt-one-txt').innerText = question.option_a;
    document.querySelector('.opt-two-txt').innerText = question.option_b;
    document.querySelector('.opt-three-txt').innerText = question.option_c;
    document.querySelector('.opt-four-txt').innerText = question.option_d;
  }
});

socket.on('answer-feedback', (data) => {
  allQuestype.forEach(option => {
    option.classList.remove('correct', 'wrong', 'selected');
  });

  const userAnswer = data.userAnswer.toLowerCase();
  const correctAnswer = data.correctAnswer.toLowerCase();
  const isCorrect = userAnswer === correctAnswer;
  const wrongSound = new Audio("../media/wrong-47985.mp3");
  const rightSound = new Audio("../media/collect-5930.mp3");
  allQuestype.forEach(option => {
    const optionText = option.querySelector('p').innerText.trim().toLowerCase();
    if (optionText === correctAnswer) {
      option.classList.add('correct');
    } else if (optionText === userAnswer && userAnswer !== correctAnswer) {
      option.classList.add('wrong');
    }
    if (isCorrect) {
      rightSound.play();
    } else {
      wrongSound.play();
    }
  });

  if (isCorrect) {
    socket.emit('next-question');
  } else {
    setTimeout(() => {
      socket.emit('next-question');
    }, 2000); 
  }
});

let selectedAnswer = '';

allQuestype.forEach(optionDiv => {
  optionDiv.addEventListener('click', () => {
    const newselected = document.querySelectorAll('.selected');
    newselected.forEach(el => {
      el.classList.remove('selected');
      el.classList.remove('wrong');
      el.classList.remove('correct');
    });
    optionDiv.classList.add('selected');
    selectedAnswer = optionDiv.querySelector('p').innerText.trim();
    warningMsg.style.display = 'none';
  });
});

submitBtn.addEventListener('click', () => {
  if (!selectedAnswer) {
    warningMsg.style.display = 'block';
    return;
  }
  warningMsg.style.display = 'none';
  console.log(` Received answer from ${nickname}: ${selectedAnswer}`);
  socket.emit('submit-answer', { nickname, answer: selectedAnswer });
  console.log("User Answer:", `"${selectedAnswer}"`);
  console.log("Correct Answer:", `"${correctAnswer}"`);
  console.log("Match?", selectedAnswer === correctAnswer);
});
