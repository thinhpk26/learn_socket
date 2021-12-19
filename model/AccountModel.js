const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/sendMessage')

const Schema = mongoose.Schema
const accountsSchema = mongoose.Schema({
    accountName: String,
    userID: String,
    username: String,
    password: String,
    rooms: [
        {
            room_ID: {type: Schema.Types.ObjectId, ref: 'roomchat'}
        }
    ]
}, {
    collection: 'ACCOUNTS'
})

const AccountsModel = mongoose.model('accounts', accountsSchema)

module.exports = AccountsModel