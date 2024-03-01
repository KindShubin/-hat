const container = document.getElementsByClassName('container')[0];
const header = document.querySelector('section.container__header');
const body = document.querySelector('section.container__body');
const footer = document.querySelector('section.container__footer');
const bodyUsername = document.querySelector('div.body__username');
const username = document.querySelector('span.username')
const changeNameButton = document.getElementById('changeNameBtn');
const changeAccountBtn = document.getElementById('changeAccountBtn');
const bodyHystory = document.querySelector('div.body__hystory');
const bodyForm = document.querySelector('div.body__form');
const form = document.getElementById('form');
const textArea = document.getElementById('textArea');
const submitButton = document.querySelector("input[type='submit']");
console.log(container);
console.log(header);
console.log(body);
console.log(footer);
console.log(bodyUsername);
console.log(username);
console.log(changeNameButton);
console.log(changeAccountBtn);
console.log(bodyHystory);
console.log(bodyForm);
console.log(form);
console.log(textArea);
console.log(submitButton);


const cookie = document.cookie;
const cookieUserName = getCookie('username');
// if (cookieUserName){
//   username.textContent = cookieUserName;
//   const changeButton = document.createElement('button');
//   changeButton.textContent = 'change name';
//   bodyUsername.append(changeButton);
//   changeButton.onclick = async(e) => {
//     e.preventDefault();
//     const newName = username.textContent;
//     let formData = new FormData();
//     formData.append('name', newName);
//     let response = await fetch('/changename', {
//       method: 'POST',
//       body: formData
//     });
//     //let result = await response.json();
//   }
// }

changeNameButton.onclick = async (e) => {
  e.preventDefault();
  const tempName = "tttttest";
  // const newName = username.textContent;
  let formData = new FormData();
  formData.append('name', 'testo');
  console.log('formData:');
  console.log(formData);
  let response = await fetch('/changename', {
    method: 'POST',
    body: 'azazaza'
  });
  let result = await response.text();
  console.log(`respond from server post: ${result}`);
}

const cookieMessage = document.createElement('div');
cookieMessage.classList.add('body__message');
cookieMessage.append(cookie);
bodyHystory.append(cookieMessage);

// WebSocket
let socket;
let sendingMessageQueue = new Map();

form.onsubmit = (e) => {
  e.preventDefault();
  const text = form.elements.textArea.value;
  if (!text) {
    return false;
  }
  socket = socket ? socket : new WebSocket("ws://localhost:3001");

  const data = {
    date: new Date().getTime(),
    from: cookieUserName,//temporary!!!
    to: 0,//0 - to all
    data: text,
  }
  console.log(`socket.readyState:${socket.readyState}`);

  if (socket.readyState == 0) {
    socket.onopen = (e) => {
      console.log('onopen WebSocket opened');
      sendMsg(data);
      textArea.value='';
    }
  } else if (socket.readyState == 1) {
    sendMsg(data);
    textArea.value='';
  }

  socket.onerror = (e) => {
    console.log('onerror error');
    console.log(e);
  }

  //received message
  socket.onmessage = (e) => {
    console.log('onmessage');
    const data = JSON.parse(e.data);
    console.log(data);
    bodyHystory.append(getPublishingMessage(data));
  }
  socket.onclose = (e) => {
    console.log('onclose Websocket close');
  }
  function sendMsg(data) {
    publishingMessage = getPublishingMessage(data);
    bodyHystory.append(publishingMessage);
    sendingMessageQueue.set(data, publishingMessage);
    socket.send(JSON.stringify(data));

  }
}

function getPublishingMessage(data) {
  for (const [key, value] of sendingMessageQueue) {
    console.log('gPM| sendingMessageQueue key.date: ' + key.date);
    console.log('gPM| sendingMessageQueue value: ' + value);
    console.log('gPM| compare date:',key.date === data.date);
    console.log('gPM| compare date:key.from === data.to',key.from === data.to);
    if ((key.from === data.to) && (key.date === data.date)) {
      sendingMessageQueue.delete(key);
      //value.style.transition = 'all linear 1s';
      //value.style.backgroundColor = '#84d391';
      //value.style = 'background-color: #84d391; transition: all 1s;';
      value.classList.add('body__message-my_sended');
      return value;
    }
  }
  const div = document.createElement('div');
  div.classList.add('body__message');
  if (data.from === cookieUserName) {
    div.classList.add('body__message-my');
  }
  const metaP = document.createElement('p');
  metaP.classList.add('body__message-meta');
  metaP.insertAdjacentHTML('afterbegin', data.from + '<br>' + getCorrectTime(new Date(data.date)));
  div.append(metaP);
  const messageP = document.createElement('p');
  messageP.textContent = data.data;
  div.append(messageP);
  return div;
}



// find cookie by the name
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function getCorrectTime(date){
  const year = date.getFullYear();
  const month = date.getMonth()+1;
  const day = date.getDay();
  const hour = date.getHours();
  const min = date.getMinutes();
  const result = `${year}.${month}.${day} ${hour}:${min}`;
  return result;
}