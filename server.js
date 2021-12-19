const express = require('express')
const uuid = require('uuid')
require('dotenv').config()
const loginRegis = require('./router/login_regis-router')
const bodyParser = require('body-parser')
const token = require('jsonwebtoken')
const path = require('path')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const RoomModel = require('./model/RoomModel')
const AccountModel = require('./model/AccountModel')
const session = require('express-session')
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'somesecret', 
    cookie: { maxAge: 60000 }
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use('/public', express.static(path.join(__dirname, './public')))

app.use('/login-regis', loginRegis)

app.get('/', async (req, res, next) => {
    const accountIDToken = req.body.accountID
    if(accountIDToken) {
        const _id = token.verify(accountIDToken, 'Thịnh&thinhhj1', { algorithm: 'RS256' })._id
        const account = await AccountModel.findOne({_id})
        if(account) {
            next()
        } else {
            res.redirect('./login-regis')
        }
    } else {
        res.redirect('./login-regis')
    }
}, async (req, res) => {
    res.render(path.join(__dirname, './views/pages/home'))
})

// app.post('/createroom', async(req, res) => {
//     const roomID = uuid.v4().split('-').join('')
//     const username = req.body.username
//     const userID = req.body.userID
//     if(userID) {
//         const 
//     }
//         await RoomModel.create({
//             roomID,
//             host: {
//                 username
//             },
//             members: {},
//         })
//     res.send({roomID, success: true})
// })

// app.get('/room-message', async (req, res) => {
//     res.render(path.join(__dirname, './views/pages/index'), {roomID: req.params.roomID})
// })

// app.post('/into-room', async (req, res) => {
//     try {
//         const roomID = req.body.roomID
//         const roomIdInStore = await RoomModel.findOne({roomID}).exec()
//         if(roomIdInStore) {
//             res.send({success: true})
//         } else {
//             res.send('Room không tồn tại')
//         }
//     }catch(err) {
//         console.log(err)
//     }
// })

io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID
    const username = socket.handshake.auth.username
    const roomID = socket.handshake.auth.roomID
    socket.roomID = roomID
    if (sessionID) {
        const room = await RoomModel.findOne({roomID})
        const session = room.members.get(sessionID)
        if (session) {
            socket.sessionID = sessionID
            socket.userID = session.userID
            socket.username = session.username
            return next()
        }
    }
    if (!username) {
        return next(new Error("invalid username"))
    }
    const createSessionID = uuid.v1()
    let createUserID
    do {
        createUserID = uuid.v4().split('-').join('')
    }while(Number.isInteger(parseInt(createUserID[0])))
    socket.sessionID = createSessionID
    socket.userID = createUserID
    socket.username = username
    next()
})

io.on('connection', async (socket) => {
    console.log('1 connection')
    joinSittingRoom(socket)
    sessions(socket)
    users(socket)
    userConnect(socket)
    createRoom(socket)
    actionChatting(socket)

    disconnect(socket)
})

function joinSittingRoom (socket) {
    const infoRoom = async(roomID) => {
        const infor = await RoomModel.findOne({roomID}).exec()
        if(infor) 
            socket.emit('information room', infor)
    }
    joinRoom(socket, infoRoom)
}

function joinRoom(socket, cb) {
    socket.on('join room', (roomID) => {
        socket.join(`${roomID} sitting-room`)
        if(cb) cb(roomID)
    })
}

function sessions(socket) {
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    })
}

async function users(socket) {
    const room = await RoomModel.findOne({roomID: socket.roomID})
    room.members.set(`${socket.sessionID}`, {
        userID: socket.userID,
        username: socket.username})
    const roomAfterUpdate = await room.save()
    const users = []
    for(let [key, value] of roomAfterUpdate.members)
        users.push(value)
    socket.emit("users", users)
}

function userConnect(socket) {
    socket.broadcast.emit("user connected", {
        socketID: socket.id,
        userID: socket.userID,
        username: socket.username,
    })
}

function createRoom(socket) {
    socket.on('create room', ({roomID, nameroom}) => {
        if(!io.sockets.adapter.rooms.has(`${roomID} ${nameroom}`)) {
            socket.join(`${roomID} ${nameroom}`)
            io.to(socket.id).emit('create room success', nameroom)
            socket.to(`${roomID} ${nameroom}`)
        }
        else io.to(socket.id).emit('create room fail')
    })
}


// chat trên những room chung
function actionChatting(socket) {
    socket.on('chat message', async ({msg, roomID, nameroom, username}) => {
        socket.to(`${roomID} ${nameroom}`).emit('chat message for everyone', {msg, nameroom, username})
        io.to(socket.id).emit('chat message for own', {msg, nameroom})
    })
    socket.on('entering message', ({roomID, nameroom, username}) => {
        socket.to(`${roomID} ${nameroom}`).emit('entering message', {nameroom, username})
    })
    socket.on('no entering message', ({roomID, nameroom, username}) => {
        socket.to(`${roomID} ${nameroom}`).emit('no entering message', {nameroom, username})
    })
}


function messagePrivate(socket) {

}

function disconnect(socket) {
    console.log('1 disconnect')
    socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
        // notify other users
        socket.broadcast.emit("user disconnected", {userID: socket.userID, username: socket.username});
        // update the connection status of the session
        const room = await RoomModel.findOne({roomID: socket.roomID})
        room.members.set(`${socket.sessionID}`, {
            userID: socket.userID,
            username: socket.username,
            connected: false,})
        await room.save()
    }
    })
}

// io.on('connection', socket => {
//     console.log(`1 user connected in room`)
    
//     // người dùng tạo living room
//     socket.emit('create bigroom')
//     socket.join('room living-room')
//     // người dùng tạo các room con

//     // khi người dùng chat

//     // khi người dùng ngắt kết nối
//     socket.on('disconnect', () => {
//         console.log(`1 user disconnected from room`);
//     });
// })


const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log('Listening on port http://localhost:' + PORT)
})