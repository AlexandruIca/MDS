var ws = new WebSocket("ws://localhost:5634/ws");
const login = document.getElementById('login')


login.addEventListener("click", () => {
    let d = {
        "User": document.getElementById('user').value,
        "Password": document.getElementById('pass').value 
    }
    ws.send(JSON.stringify(d));    
})
