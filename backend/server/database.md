## Database
users:

	user_id integer PRIMARY KEY,
	email text,
	password text,
	first_name text,
	last_name text

groups: 

	group_id integer PRIMARY KEY,
	group_name text,
	is_dm integer                           - daca este conversatie privata intre doi utilizatori


participans:

	group_id integer PRIMARY KEY,      - tabela asociativa
	user_id integer PRIMARY KEY,
	joined_on text                     - data la care a intrat in grup

files: 

	file_id integer PRIMARY KEY,
        file_                                    - tipul blob, aici va fi efectiv fisierul 

messages:

	message_id integer PRIMARY KEY,
	date_ text,                           - sqlite nu are format special pt date asa ca folosim text
	conv_id integer,                      - conversatia/grupul unde a fost trimis mesajul
	sender_id integer,
	reply integer,                        - "parintele" reply-ului
	mess_text text,                       - continutul text al mesajului
	file_id integer

starred_messages:

	user_id integer PRIMARY KEY,
	message_id integer