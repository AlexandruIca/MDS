var ws = new WebSocket("ws://localhost:5634/ws");
const login = document.getElementById('login')


login.addEventListener("click", () => {
    let d = {
        "Email": document.getElementById('email').value,
        "Fst": document.getElementById('fst').value,
        "Snd": document.getElementById('snd').value,
        "Password": document.getElementById('pass').value 
    }
    ws.send(JSON.stringify(d));    
})
