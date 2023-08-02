import { showAlert } from './alerts.js';

const signup = async (name, email, password, cpassword) => {
    // console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: '/signup',
            data: {
                name,
                email,
                password,
                cpassword
            }
        });
            
        if (res.data.status === 'success') {
        //   showAlert('success', 'Logged in successfully!');
          window.setTimeout(() => {
            location.assign('/');
          }, 1500);
        }
      } catch (err) {
        // console.log(JSON.stringify(err.response.data));
        const errorMessage = err.response.data.match(/Error: (.*)\s+/)[1];
        const errorWithoutFilePath = errorMessage.split('<br>')[0].trim();
        // console.log(errorWithoutFilePath)
        showAlert('error', errorWithoutFilePath);
      }
}



document.querySelector('.signup').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const cpassword = document.getElementById('confirm-password').value;
    signup(name, email, password, cpassword);

});