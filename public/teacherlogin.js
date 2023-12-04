const form = document.querySelector('#login-form');
const loginBtn = form.querySelector('#login-btn');
const backBtn = document.querySelector(".back-btn");
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const username = form.querySelector('#username');
  const password = form.querySelector('#password');
  fetch('/login', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({username: username.value, password: password.value}),
            redirect: "follow"

          })
          .then(res => {
              if(res.redirected)
              {
                location.href = res.url
              }
              return res.json();
          })
          .then(data => ShowError(data))
          
});

backBtn.addEventListener('click', (e) => {
  location.href = "/";
})

function ShowError(error)
{
  const errorDiv = document.querySelector(".error");
  errorDiv.style.display = "block";
  errorDiv.querySelector('span').textContent = error.status;
}