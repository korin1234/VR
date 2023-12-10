const form = document.querySelector('#login-form');
const loginBtn = form.querySelector('#login-btn');
const backBtn = document.querySelector(".back-btn");
const forgotPasswordForm = document.querySelector(".forgot-password-form");
const errorDiv = document.querySelector(".error");

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
                window.location.href = res.url
              }
              return res.json();
              
          })
          .then(data => ShowError(data))
          
});

backBtn.addEventListener('click', (e) => {
  location.href = "/";
})

document.querySelector("#forgot-password").addEventListener("click", (e) => {
  if(forgotPasswordForm.style.display == "flex")
  {
    forgotPasswordForm.style.display = "none";
  }
  else
  {
    forgotPasswordForm.style.display = "flex";
    
  }
  errorDiv.style.display = "none";
  
});

form.querySelector('#username').addEventListener("focus", (e) => {
  forgotPasswordForm.style.display = "none";
})
form.querySelector('#password').addEventListener("focus", (e) => {
  forgotPasswordForm.style.display = "none";
})
forgotPasswordForm.querySelector(".send-link-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const email = forgotPasswordForm.querySelector("#email").value;
  fetch('/forgot-password', {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({email: email}),
          })
          .then(res => {
              return res.json();
          })
          .then(data => ShowError(data))
})

function ShowError(data)
{
  
  const icon = errorDiv.querySelector('i');
  const span = errorDiv.querySelector('span');

  errorDiv.style.display = "block";
  if(data.status == "error")
  {
    span.style.color = "red";
    icon.classList.remove(...icon.classList);
    icon.classList.add("bi-exclamation-triangle-fill");
  }
  else
  {
    span.style.color = "green";
    icon.classList.remove(...icon.classList);
    icon.classList.add("bi-check");
  }
  span.textContent = data.message;
  
  
}