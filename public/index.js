"use strict"
const socket = io("", {autoConnect: false})
const roomIdElement = document.querySelector('.roomId')
const hostname = document.querySelector('.host')
const inputCreateElement = document.getElementById('input-create-room')
const listMsgContainner = document.querySelector('#container-list-msg')
const formCreateRoom = document.getElementById('create-small-room')
const serverSend = document.querySelector('.server-return') 
const listuserIntoRoomElement = document.querySelector('.user-into-room')
const username = localStorage.getItem('username')
const sessionID = localStorage.getItem('sessionID')
const usersSaveClient = new userIntoRoom()

;(function() {
  socket.auth = {username, sessionID, roomID}
  socket.connect()
})()

// thông tin của room
socket.on('information room', (infor) => {
    roomIdElement.innerHTML = 'RoomID: ' + infor.roomID
    hostname.innerHTML = 'Phòng của: ' + infor.host.username
})

socket.emit('join room', roomID)

socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
        socket.off()
    }
})

socket.on("session", ({ sessionID, userID }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID
})

socket.on("users", async (users) => {
    users.forEach((user) => {
        user.self = user.userID === socket.id
        usersSaveClient.addUser(user)
    })
    // const usersSaved = usersSaveClient.users.sort((a, b) => {
    //     if (a.self) return -1
    //     if (b.self) return 1
    //     if (a.username < b.username) return -1
    //     return a.username > b.username ? 1 : 0
    // })
    // console.log(usersSaved)
    users.forEach((user, index) => {
        createUserElement(user, index)
    })

})

function createUserElement(user, index) {
    const userElement = document.createElement('li')
    if(index === 0) {
        userElement.textContent = user.username + '(yourself)'
    } else {
        userElement.textContent = user.username
    }
    const activeOrNot = document.createElement('div')
    if(user.connected === false) activeOrNot.setAttribute('class', `active-or-not ${user.userID} no-active`)
    else activeOrNot.setAttribute('class', `active-or-not ${user.userID} active`)
    activeOrNot.innerHTML = `<i class="fas fa-dot-circle mx-3"></i><i class="fas fa-circle mx-3"></i>`
    userElement.appendChild(activeOrNot)
    userElement.setAttribute('class', 'user-into-room-item color-white mx-3')
    listuserIntoRoomElement.appendChild(userElement)
}

socket.on("user connected", (user) => {
    console.log(`${user.username} vừa connect`)
    console.log(usersSaveClient.users)
    if(!usersSaveClient.haveUser(user)) {
        usersSaveClient.addUser(user)
        createUserElement(user)
    }
    const userConnectElement = document.querySelector(`.active-or-not.${user.userID}`)
    if(userConnectElement) {
        userConnectElement.classList.remove('no-active')
        userConnectElement.classList.add('active')
    }
})

socket.on("user disconnected", ({userID, username}) => {
    console.log(`${username} vừa disconnect`)
    const userElement = document.querySelector(`.active-or-not.${userID}`)
    userElement.classList.remove('active')
    userElement.classList.add('no-active')
})


socket.emit('message private', () => {
    
})

socket.on('message private', () => {

})






// tạo room
formCreateRoom.addEventListener('submit', (e) => {
    e.preventDefault()
    const nameroom = inputCreateElement.value
    if(inputCreateElement.value && inputCreateElement.value !== '') {
        socket.emit('create room', {roomID, nameroom, usersWillIntoRoom})
        inputCreateElement.value = ''
    }
})
// Tạo room thành công
socket.on('create room success', nameroom => {
    serverSend.innerHTML = `<span class="span-server-send">Tạo thành công room ${nameroom}</span>`
    const itemMsg = document.createElement('li')
    itemMsg.setAttribute('class', 'item-msg')
    itemMsg.setAttribute('data-name-room', nameroom)
    itemMsg.innerHTML = 
    `<h4>${nameroom}</h4>
    <ul class="message-list" data-name-room='${nameroom}'></ul>
    <form class="form-message">
        <div class='section-chat'>
            <input class="input-chat" autocomplete="off"/>
            <button class="btn-chat">
                Send
            </button>
        </div>
    </form>`
    listMsgContainner.appendChild(itemMsg)
    const formSendMsgElement = document.querySelectorAll('.form-message')
    // nhắn tin trong room
    formSendMsgElement.forEach(form => {
        const inputChatElement = form.querySelector('.input-chat')
        form.addEventListener('submit', e => {
            const valueInputChat = inputChatElement.value
            e.preventDefault()
            if(valueInputChat && valueInputChat !== '') {
                socket.emit('chat message', {msg: valueInputChat, roomID, nameroom, username})
                inputChatElement.value = ''
            }
        })
        // inputChatElement.addEventListener('input', () => {
        //     if(inputChatElement.value == '') {
        //         socket.emit('no entering message', {roomID, nameroom, username})
        //     }
        //     if(inputChatElement.value) {
        //         if(inputChatElement.value != '') socket.emit('entering message', {roomID, nameroom, username})
        //     }
        // })
    })
})
// Tạo room fail
socket.on('create room fail', () => {
    serverSend.innerHTML = `<span class="span-server-send">ID room tồn tại vui lòng nhập lại</span>`
})

// Chat room ban đầu
const formSendMsgElement = document.querySelector('.form-message')
const inputChatElement = listMsgContainner.querySelector('.input-chat')
const messageListElement = document.querySelector('.message-list')
formSendMsgElement.addEventListener('submit', e =>{
    e.preventDefault()
    const nameroom = messageListElement.getAttribute('data-name-room')
    if(inputChatElement.value && inputChatElement.value !== '') {
        socket.emit('chat message', {msg: inputChatElement.value, roomID, nameroom, username})
        inputChatElement.value = ''
    }
})

inputChatElement.addEventListener('input', e => {
    const nameroom = messageListElement.getAttribute('data-name-room')
    if(inputChatElement.value) {
        if(inputChatElement.value === '') {
            socket.emit('no entering message', {roomID, nameroom, username})
        } else socket.emit('entering message', {roomID, nameroom, username})
    }
})

// event chat message
const createLineMessage = text => {
    const lineMsg = document.createElement('li')
    lineMsg.textContent = text
    return lineMsg
}

socket.on('chat message for everyone', ({msg, nameroom, username}) => {
    const allMsgListElement = document.querySelectorAll('.message-list')
    allMsgListElement.forEach(msgList => {
        const lineMsgElement = createLineMessage(`${username}: ${msg}`)
        if(msgList.getAttribute('data-name-room') === nameroom) {
            msgList.appendChild(lineMsgElement)
        }
    })
})

socket.on('chat message for own', ({msg, nameroom}) => {
    const allMsgListElement = document.querySelectorAll('.message-list')
    allMsgListElement.forEach(msgList => {
        const lineMsgElement = createLineMessage(`Bạn: ${msg}`)
        if(msgList.getAttribute('data-name-room') === nameroom) {
            msgList.appendChild(lineMsgElement)
        }
    })
})

socket.on('entering message', ({nameroom, username}) => {
    const allMsgListElement = document.querySelectorAll('.message-list')
    allMsgListElement.forEach(msgList => {
        if(msgList.getAttribute('data-name-room') === nameroom) {
            const liLastestElement = msgList.querySelector('li:last-child')
            if(!liLastestElement || !(liLastestElement.textContent.includes('Đang nhập'))) {
                const lineMsgElement = createLineMessage(`${username}: Đang nhập`)
                msgList.appendChild(lineMsgElement)
            }
        }
    })
})

socket.on('no entering message', ({nameroom, username}) => {
    const allMsgListElement = document.querySelectorAll('.message-list')
    allMsgListElement.forEach(msgList => {
        if(msgList.getAttribute('data-name-room') === nameroom) {
            const lineMsgElement = createLineMessage(`${username}: Đang không nhập`)
            msgList.appendChild(lineMsgElement)
        }
    })
})



// Khi chat message

// // check lại






// event chat
// form.addEventListener('submit', function(e) {
//     e.preventDefault()
//     if (input.value) {
//         socket.emit('chat message', input.value)
//         input.value = ''
//     }
// })

// socket.on('chat message', function(msg) {
//     console.log(msg)
//     const item = document.createElement('li')
//     item.textContent = msg
//     messages.appendChild(item)
//     window.scrollTo(0, document.body.scrollHeight)
// });

// socket.on('chatting', function(msg) {
//     const elementLastest = messages.querySelector('li:last-child')
//     if(!elementLastest) {
//         const item = document.createElement('li')
//         item.textContent = msg
//         messages.appendChild(item)
//         window.scrollTo(0, document.body.scrollHeight)
//     }
//     else if(!(elementLastest.textContent == 'Đang nhập')) {
//         const item = document.createElement('li')
//         item.textContent = msg
//         messages.appendChild(item)
//         window.scrollTo(0, document.body.scrollHeight)
//     }
// })

// socket.on('no chat', function(msg) {
//     const item = document.createElement('li')
//     item.textContent = msg
//     messages.appendChild(item)
//     window.scrollTo(0, document.body.scrollHeight)
// })



// vào phòng


