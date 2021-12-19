const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/sendMessage')

const roomsSchema = mongoose.Schema({
    roomID: String,
    host: {
        username: String,
        userID: String,
    },
    members: {
        type: Map,
        of: String,
        ref: 'accounts',
    }
}, {
    collection: 'ROOMCHAT'
})

const RoomsModel = mongoose.model('roomchat', roomsSchema)

module.exports = RoomsModel