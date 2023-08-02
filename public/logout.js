const logout = async () => {
  try {
    console.log("logout");
    const res = await axios({
      method: 'GET',
      url: '/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};

document.querySelector('.logout').addEventListener('submit', e => {
    e.preventDefault();
    logout();

});