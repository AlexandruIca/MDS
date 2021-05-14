from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from log import logger

import sqlite3

db = sqlite3.connect('server.db')
cursor = db.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS users (
        user_id integer PRIMARY KEY,
        email text,
        password text,
        first_name text,
        last_name text
    )""")
db.commit()

cursor.execute("""CREATE TABLE IF NOT EXISTS groups (
    group_id integer PRIMARY KEY,
    group_name text,
    is_dm integer
)""")
db.commit()

cursor.execute("""CREATE TABLE IF NOT EXISTS participans (
    group_id integer,
    user_id integer,
    joined_on text,
    PRIMARY KEY (group_id, user_id)
)""")
db.commit()

cursor.execute("""CREATE TABLE IF NOT EXISTS files (
    file_id integer PRIMARY KEY,
    file_
)""")
db.commit()

cursor.execute("""CREATE TABLE IF NOT EXISTS messages (
        message_id integer PRIMARY KEY,
        date_ text,
        conv_id integer,
        sender_id integer,
        reply integer,
        mess_text text,
        file_id integer,
        FOREIGN KEY(conv_id) REFERENCES groups(group_id),
        FOREIGN KEY(sender_id) REFERENCES users(user_id),
        FOREIGN KEY(file_id) REFERENCES files(file_id)
)""")
db.commit()

cursor.execute("""CREATE TABLE IF NOT EXISTS starred_messages (
    user_id integer PRIMARY KEY,
    message_id integer,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(message_id) REFERENCES messages(message_id)
)""")
db.commit()




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


def insert_message(msg: str):
    db_cursor = db.cursor()
    db_cursor.execute('INSERT INTO messages(content) VALUES(?)', (msg,))
    db.commit()


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await manager.send_personal_message('To be sent!', websocket)

    try:
        while True:
            data = await websocket.receive_text()
            insert_message(f'{data}')
            await manager.send_personal_message(f'You wrote: {data}', websocket)
            await manager.broadcast(f'Somebody said: {data}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.on_event('startup')
def startup_event():
    logger.info('Starting application, setting up database...')
    cursor = db.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS messages(content text)')
    db.commit()


@app.on_event('shutdown')
def shutdown_event():
    logger.info('Shutting down, closing database connection...')
    db.close()
