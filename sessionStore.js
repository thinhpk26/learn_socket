class InsessionStore {
    constructor() {
        this.session = new Map()
    }
    findSession(id) {
        return this.session.get(id)
    }
    saveSession(id, session) {
        this.session.set(id, session)
    }
    getAllSession() {
        return [...this.session.values()]
    }
}

module.exports = InsessionStore