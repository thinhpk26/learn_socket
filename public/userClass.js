class userIntoRoom {
    constructor() {
        this.users = []
    }
    addUser(user) {
        const lengthListUsers = this.users.length
        if(lengthListUsers > 0) {
            if(!this.haveUser(user))
                this.users.push(user)
        } else {
            this.users.push(user)
        }
    }
    haveUser(user) {
        const lengthListUsers = this.users.length
        let haveUser = false
        for(let i=0; i<lengthListUsers; ++i) {
            if(this.users[i].userID === user.userID) {
                return haveUser = true
            }
        }
        return false
    }


}