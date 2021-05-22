from server import database

db: database.Database = database.Database('test.db')
db.create_schema()


def test_hashing():
    db.insert_user(email='abc@email.com', first_name='', last_name='', password='123')
    assert db.check_user(email='abc@email.com', password='123')
    assert not db.check_user(email='abc@email.com', password='@#$@')


def test_hashing_casing():
    db.insert_user(email='xyz@email.com', first_name='', last_name='', password='Abc')
    assert db.check_user(email='xyz@email.com', password='Abc')
    assert not db.check_user(email='xyz@email.com', password='abc')
