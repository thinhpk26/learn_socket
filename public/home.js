const inputNameUser = document.querySelector('.input-create-room')
const inputIntoRoom = document.querySelector('.input-into-room')
const btnIntoRoom = document.querySelector('.button-into-room')
const btnCreate = document.querySelector('.button-create-room')

// create phòng
btnCreate.addEventListener('click', async () => {
    const username = inputNameUser.value
    const userID = localStorage.getItem('userID')
    if(username && username !== '') {
        try {
            const dataCreate = await axios({
                method: 'post',
                url: 'http://localhost:3000/createroom',
                data: {
                    username,
                    userID,
                }
            })
            if(dataCreate.data.success) {
                localStorage.setItem('username', username)
                localStorage.setItem('roomID', dataCreate.data.roomID)
                window.location.href = `http://localhost:3000/room-message`
            }
        }
        catch(err) {
            console.error(err)
        }
    }
})

btnIntoRoom.addEventListener('click', () => {
    const username = inputNameUser.value
    const roomID = inputIntoRoom.value
    if(username && username !== '') {
        axios({
            method: 'post',
            url: 'http://localhost:3000/into-room',
            data: {roomID}
        })
        .then(({data}) => {
            if(data.success) {
                localStorage.setItem('username', username)
                window.location.href = 'http://localhost:3000/room-message/' + roomID
            }
            else console.log('ID không chính xác')
        })
        .catch(err => {
            console.log(err)
        })
    }
})