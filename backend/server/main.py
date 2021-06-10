from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

import json

from log import logger
from database import Database

activated = 0
db: Database = Database('server.db')
app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/activation/{id}", response_class=HTMLResponse)
async def activation():
    global activated
    activated = 1
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mail Confirmation</title>
        </head>
        <body>
            <h2 style="color: chocolate; text-align: center; margin-top: 25%; margin-bottom: 25%;">Your mail is confirmed. Enjoy the application!</h2>
        </body>
        </html>
        """


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            load_json = list(json.loads(data).values())
            print(load_json)
            if load_json[0] == "signin":
                email, password = load_json[1:]
                if db.check_user(email, password):
                    user_id = db.get_id_for_user(email)
                    _, first_name, last_name = db.get_user_info(user_id)

                    answer_json = {
                        "type": "signin",
                        "status": "ok",
                        "user_id": user_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "groups": []
                    }
                    user_id: int = db.get_id_for_user(email)

                    for group in db.get_groups_for_user(user_id):
                        convos = db.get_group_info(group)
                        answer_json["groups"].append(convos)

                    await manager.send_personal_message(json.dumps(answer_json), websocket)
                else:
                    answer_json = {"type": "signin", "status": "error"}
                    await manager.send_personal_message(json.dumps(answer_json), websocket)
            elif load_json[0] == "send-message":
                sender = load_json[1]  # 'from'
                conversation = int(load_json[2])  # 'to'
                text = load_json[3]  # 'text'
                user_id = db.get_id_for_user(sender)
                user_email, first_name, last_name = db.get_user_info(user_id)
                (msg_id, msg_date) = db.insert_message(user_id, conversation, text)
                user_name = user_email if not first_name or not last_name else f'{first_name} {last_name}'

                answer = {
                    "type": "receive-message",
                    "conversation": conversation,
                    "id": msg_id,
                    "sender": user_id,
                    "sender_email": user_email,
                    "sender_name": user_name,
                    "text": text,
                    "date": msg_date,
                }
                await manager.send_personal_message(json.dumps(answer), websocket)
            elif load_json[0] == "users":
                users = []
                for user in db.each_user():
                    if user != load_json[1]:
                        users.append(user[1])
                await manager.send_personal_message(json.dumps({"type": "getUsers", "users": users}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.websocket('/activated')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            load_json = list(json.loads(data).values())
            print(load_json)
            if load_json[0] == "signup" and not activated:
                answer_json = {"type": "signup", "status": ""}
                await manager.send_personal_message(json.dumps(answer_json), websocket)
            else:
                email, first, second, password = load_json[1:]
                db.insert_user(email=email, first_name=first, last_name=second, password=password)
                answer_json = {"type": "signup", "status": "ok"}
                await manager.send_personal_message(json.dumps(answer_json), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.on_event('startup')
def startup_event():
    logger.info('Starting application, setting up database...')
    db.create_schema()


@app.on_event('shutdown')
def shutdown_event():
    logger.info('Shutting down, closing database connection...')
    db.shutdown()
