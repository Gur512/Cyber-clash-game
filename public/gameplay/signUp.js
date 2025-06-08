'use strict';
function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, selector, callback) {
  return selector.addEventListener(event, callback);
}

const socket = io();
const selectName = select('.select-name');
const playerName = select('#playerName');
const waitingMessage = select('#waitingMessage');
const playerLobby = select('#playerLobby');

socket.on('gameStarted', () => {
  waitingMessage.style.display = 'none';
  playerLobby.style.display = 'flex'; 
});


selectName.addEventListener('click', () => {
  const nickname = playerName.value.trim();
  if (!nickname) {
    alert("Please enter your name!");
    return;
  } 
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('profilePic', imageFiles[imageIndex].split('/').pop());
  window.location.href = "./index.html";
});


let profilePic = "";
let imageIndex = 0;
const avatar = select(".avatar");
const rightArrow = select(".right-arrow");
const leftArrow = select(".left-arrow");

const imageFiles = ["../img/ded.png", "../img/devil.png", "../img/happy.png", "../img/star.png", "../img/think.png", "../img/wink.png", "../img/worry.png"];
profilePic = imageFiles[imageIndex];
avatar.src = profilePic;

listen("click", rightArrow,() => {
  imageIndex++;
  console.log("imageIndex");
  if (imageIndex === imageFiles.length) {
    imageIndex = 0;
  }
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
  console.log("Selected avatar index:", imageIndex);
});

listen("click", leftArrow,() => {
  imageIndex--;
  if (imageIndex < 0) {
    imageIndex = imageFiles.length - 1;
  }
  profilePic = imageFiles[imageIndex];
  avatar.src = profilePic;
  console.log("Selected avatar index:", imageIndex);
});
