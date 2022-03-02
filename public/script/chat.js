const socket = io();
console.log("Connected to server");

const $messageForm = document.querySelector('.form-container');
const $messageFormButton = $messageForm.querySelector('button');
const $messageFormInput = $messageForm.querySelector('input');
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll=()=>{
  //new message element
  const $newMessage = $messages.lastElementChild

  //HEight of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height 
  const visibleHeight = $messages.offsetHeight

  //height of message container
  const containerHeight = $messages.scrollHeight;

  //How far have scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset){ //Checking if we are at the bottom of the container before adding new message
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on("serverMessage", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    username: message.username,
    message : message.text,
    createdAt: moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend',html)
  autoscroll();
});

socket.on("locationMessage",(message)=>{
  console.log(message)
  //Mustache is used to render html elements
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("hh:mm a"),
  });
  $messages.insertAdjacentHTML('beforeend',html)
  
})

socket.on('roomData',({room, users})=>{
  const html = Mustache.render(sideBarTemplate,{
    room,
    users
  })
  document.getElementById('sidebar').innerHTML= html
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled')
  
  const message = e.target.elements.input.value;
  
  socket.emit("sendMessage", message, (error) => {

    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = '';
    $messageFormInput.focus()
    if (error) {
      return console.log(error);
    }
    console.log("message was delivered");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  $locationButton.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    socket.emit("location", coords, () => {
      $locationButton.removeAttribute('disabled')
      console.log("Location shared");
    });

});
});


socket.emit('join',{username, room},(error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
})