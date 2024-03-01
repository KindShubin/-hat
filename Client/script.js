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
    //body: formData
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
let sendingMessageQueue = [];
form.onsubmit = (e) => {
  console.log('form.onsubmit. socket:', socket);
  e.preventDefault();
  const text = form.elements.textArea.value;
  console.log('text from textArea:', text);
  if (!text) {
    return false;
  }
  socket = socket ? socket : new WebSocket("ws://localhost:3001");

  const data = {
    date: new Date(),
    from: cookieUserName,//temporary!!!
    to: 0,//0 - to all
    data: text,
  }
  console.log(`socket.readyState:${socket.readyState}`);

  if (socket.readyState == 0) {
    socket.onopen = (e) => {
      console.log('onopen WebSocket opened');
      sendMsg(data);
    }
  } else if (socket.readyState == 1) {
    sendMsg(data);
  }

  socket.onerror = (e) => {
    console.log('onerror error');
    console.log(e);
  }
  socket.onmessage = (e) => {
    console.log('onmessage');
    const data = e.data;
    console.log(data);
    console.log(JSON.parse(data));
    console.log(`onmessage sendingMessageQueue:${sendingMessageQueue}`);
    bodyHystory.append(getPublishingMessage(data));
    console.log(`onmessage sendingMessageQueue:${sendingMessageQueue}`);
  }
  socket.onclose = (e) => {
    console.log('onclose Websocket close');
  }
  function sendMsg(data){
    publishingMessage = getPublishingMessage(data);
    bodyHystory.append(publishingMessage);
    sendingMessageQueue.push([data, publishingMessage]);
    socket.send(JSON.stringify(data));
    console.log(`sendingMessageQueue:${sendingMessageQueue}`);
  }
}

function getPublishingMessage(data){
  const div = document.createElement('div');
  div.classList.add('body__message');
  if(data.from === cookieUserName) {
    div.classList.add('body__message-my');
  }
  if(data.from === data.to){
    const sendedMessage = sendingMessageQueue.filter((el) => {
      console.log('gPM| sendingMessageQueue.el[0]:'+el[0]);
      console.log('gPM| sendingMessageQueue.data:'+data);
      if(el[0] == data){
        return el;
      }
    })[1];
    console.log('gPM| sendedMessage:'+sendedMessage);
    sendingMessageQueue = sendingMessageQueue.filter((el) => el[0] != data);
    sendedMessage.classList.add('body__message-my_sended');
  }
  const metaP = document.createElement('p');
  metaP.style = "font-size: 0.8em; color: grey;";
  metaP.textContent = data.from + '/n' + data.date;
  div.append(metaP);
  const messageP = document.createElement('p');
  metaP.textContent = data.data;
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