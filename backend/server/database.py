from typing import Any, Tuple

import sqlite3
from sqlite3 import Connection, Cursor
from log import logger

import os
import bcrypt


class Database:
    def __init__(self, location: str):
        self.db: Connection = sqlite3.connect(location)
        logger.info(f'Created database at: {os.path.abspath(location)}')

    def create_schema(self):
        cursor: Cursor = self.db.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id integer PRIMARY KEY AUTOINCREMENT,
            email text,
            password text,
            first_name text,
            last_name text)
        ''')
        logger.info('Created table `users`')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            group_id integer PRIMARY KEY AUTOINCREMENT,
            group_name text,
            is_dm integer)
        ''')
        logger.info('Created table `groups`')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS participants (
            group_id integer,
            user_id integer,
            joined_on text,
            PRIMARY KEY (group_id, user_id))
        ''')
        logger.info('Created table `participants`')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS files (
            file_id integer PRIMARY KEY AUTOINCREMENT,
            file_)
        ''')
        logger.info('Created table `files`')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            message_id integer PRIMARY KEY AUTOINCREMENT,
            date_ text,
            conv_id integer,
            sender_id integer,
            reply integer,
            mess_text text,
            file_id integer,
            FOREIGN KEY(conv_id) REFERENCES groups(group_id),
            FOREIGN KEY(sender_id) REFERENCES users(user_id),
            FOREIGN KEY(file_id) REFERENCES files(file_id))
        ''')
        logger.info('Created table `messages`')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS starred_messages (
            user_id integer PRIMARY KEY,
            message_id integer,
            FOREIGN KEY(user_id) REFERENCES users(user_id),
            FOREIGN KEY(message_id) REFERENCES messages(message_id))
        ''')
        logger.info('Created table `starred_messages`')

        self.db.commit()

    def shutdown(self):
        self.db.commit()
        self.db.close()

    def insert_user(self, email: str, first_name: str, last_name: str, password: str):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

        cursor: Cursor = self.db.cursor()
        cursor.execute('''
        INSERT INTO
            users(email, password, first_name, last_name)
        VALUES (?, ?, ?, ?)
        ''', (email, hashed, first_name, last_name))
        self.db.commit()
        logger.info(f'Inserted user `{first_name} {last_name}, password={hashed}`')

    def check_user(self, email: str, password: str) -> bool:
        cursor: Cursor = self.db.cursor()
        cnt = cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', (email,)).fetchone()

        if int(cnt[0]) == 0:
            return False

        hashed = cursor.execute('SELECT password FROM users WHERE email = ?', (email,)).fetchone()

        return bcrypt.checkpw(password.encode('utf-8'), str(hashed[0]).encode('utf-8')[2:-1])

    def get_id_for_user(self, email: str) -> int:
        cursor: Cursor = self.db.cursor()
        query: str = 'SELECT user_id FROM users WHERE email = ?'

        return int(cursor.execute(query, (email,)).fetchone()[0])

    def get_user_info(self, user_id: int) -> Tuple[str, str, str]:
        cursor: Cursor = self.db.cursor()
        query: str = 'SELECT email, first_name, last_name FROM users WHERE user_id = ?'

        return cursor.execute(query, (user_id,)).fetchone()

    def get_groups_for_user(self, user_id: int) -> int:
        cursor: Cursor = self.db.cursor()
        query: str = '''
        SELECT
            group_id
        FROM
            participants
        WHERE
            user_id = ?
        '''

        for row in cursor.execute(query, (user_id,)):
            yield int(row[0])

    def get_group_info(self, group_id: int) -> Any:
        info = {}

        cursor: Cursor = self.db.cursor()
        query: str = '''
        SELECT
            group_id, group_name
        FROM
            groups
        WHERE
            group_id = ?
        '''

        (group_id, group_name) = cursor.execute(query, (group_id,)).fetchone()
        info['groupId'] = group_id
        info['groupName'] = group_name
        info['messages'] = []

        query: str = '''
        SELECT
            message_id, date_, conv_id, sender_id, reply, mess_text
        FROM
            messages
        WHERE
            conv_id = ?
        '''

        for msg in cursor.execute(query, (group_id,)):
            sender_id = int(msg[3])
            (email, first_name, last_name) = self.get_user_info(sender_id)
            sender_name_format = f'{first_name} {last_name}'
            sender_name = sender_name_format if len(sender_name_format) > 0 else email

            info['messages'].append({
                'id': msg[0],
                'date': msg[1],
                'conversation_id': msg[2],
                'sender_id': sender_id,
                'sender_email': email,
                'sender_name': sender_name,
                'is_reply': msg[4],
                'text': msg[5],
            })

        return info

    # returns: message_id + message_date
    def insert_message(self, sender_id: int, conversation_id: int, text: str) -> Tuple[int, str]:
        cursor: Cursor = self.db.cursor()

        cursor.execute('''
        INSERT INTO
            messages(
                date_,
                conv_id,
                sender_id,
                reply,
                mess_text,
                file_id
            )
        VALUES (
            datetime('now'),
            ?,
            ?,
            0,
            ?,
            NULL
        )
        ''', (conversation_id, sender_id, text))

        message_id = int(cursor.lastrowid)
        message_date = cursor.execute('''
            SELECT date_ FROM messages WHERE message_id = ?
        ''', (message_id,)).fetchone()[0]

        return (message_id, message_date)

    def each_user(self) -> Any:
        cursor: Cursor = self.db.cursor()

        for row in cursor.execute('SELECT * FROM users'):
            yield row
