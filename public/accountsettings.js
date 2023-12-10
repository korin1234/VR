const changePasswordForm = document.querySelector("#change-credentials-form");
const backBtn = document.querySelector(".back-btn");

document.querySelector('#update-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const username = changePasswordForm.querySelector("#change-username");
  const password = changePasswordForm.querySelector("#change-password");
  if(location.href.includes("/reset-password"))
  {
    fetch(location.href, {
            method: 'POST',  
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({username: username.value, password: password.value}),

          })
          .then(res => {return res.json()})
          .then(data => showServerResponse(data))
  }
  else
  {
    fetch('/change-user-credentials', {
          method: 'POST',  
          headers: {'Content-Type': 'application/json', },
          body: JSON.stringify({username: username.value, password: password.value}),

        })
        .then(res => {return res.json()})
        .then(data => showServerResponse(data))
  }
   
})

function showServerResponse(data)
{
  const response = document.querySelector(".server-response");
  response.innerHTML = "";
  
  const icon = document.createElement("i");
  const span = document.createElement("span");
  span.textContent = data.status;
  if(data.info == "error")
  {
    response.style.color = "red";
    icon.classList.add("bi-exclamation-triangle-fill");
    
  }
  else
  {
    response.style.color = "green";
    icon.classList.add("bi-check");
    
  }
  response.append(icon);
  response.append(span);
  
}
backBtn.addEventListener('click', (e) => {
  location.href = "/teacher";
})