const express = require("express")
const token = require("jsonwebtoken")
const path = require("path")
const uuid = require("uuid")
const AccountsModel = require("../model/AccountModel")
const loginRegis = express.Router()

loginRegis.use('/', async (req, res, next) => {
    const accountIDToken = req.body.accountID
    if(accountIDToken) {
        const _id = token.verify(accountIDToken, 'Thịnh&thinhhj1', { algorithm: 'RS256' })._id
        const account = await AccountsModel.findOne({_id})
        account ? res.redirect('../') : next()
    } else next()
})

loginRegis.get('/', (req, res) => {
    res.render(path.join(__dirname, '../views/pages/regis_login.ejs'))
})

loginRegis.post('/regis', async (req, res) => {
    const accountName = req.body.accountName
    const username = req.body.username
    const password = req.body.password
    const userID = uuid.v4()
    const hasAccount = AccountsModel.findOne({accountName})
    if(hasAccount) {
        const account = new AccountsModel({
            accountName,
            userID,
            username,
            password,
            rooms: []
        })
        const accountCreated = await account.save();
        const accountIDToken = token.sign({_id: accountCreated._id}, 'Thinh&thinhhj1', { algorithm: 'RS256' })
        res.send({success: true, accountID: accountIDToken})
    }
    else res.send('Đã có tài khoản')
})

loginRegis.post('/login', async (req, res, next) => {
    const accountName = req.body.accountName
    const password = req.body.password
    if(accountName, password) {
        const account = await AccountsModel.findOne({accountName, password})
        const accountIDToken = token.sign({_id: account._id}, 'Thinh&thinhhj1', { algorithm: 'RS256'})
        if(account) res.send({success: true, accountID: accountIDToken})
        else res.send('Không chính xác')
    }
})

module.exports = loginRegis