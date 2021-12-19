const loginRegis = document.querySelector('.login-regis')
const closeRegis = () => {
    loginRegis.classList.remove('appear-regis')
}
const appearRegis = () => {
    loginRegis.classList.add('appear-regis')
}

const 

const formLogin = document.querySelector('.form-login')
const formRegis = document.querySelector('.form-regis')

async function submitLogin() {
    let dataOfUser;
    formRegis.querySelectorAll('input').forEach(input => {
        if(input.value === '' || !input.value) {
            console.log()
        }
    })
    const dataFromLogin = await axios({
        method: 'post',
        url: 'http://localhost:3000/login-regis/login',
        data: {}
    })
}

function submitRegis() {

}