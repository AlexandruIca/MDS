from typing import Any

import sqlite3
from sqlite3 import Connection, Cursor
from log import logger

import os


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
        CREATE TABLE IF NOT EXISTS participans (
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
        self.db.close()

    def insert_user(self, email: str, first_name: str, last_name: str, password: str):
        cursor: Cursor = self.db.cursor()
        cursor.execute('''
        INSERT INTO
            users(email, password, first_name, last_name)
        VALUES (?, ?, ?, ?)
        ''', (email, password, first_name, last_name))
        self.db.commit()
        logger.info(f'Inserted user `{first_name} {last_name}`')

    def each_user(self) -> Any:
        cursor: Cursor = self.db.cursor()

        for row in cursor.execute('SELECT * FROM users').fetchall():
            yield row
