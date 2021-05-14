[![StaticAnalysis](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml)
[![Testing](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml)
---
# Real Time Messaging

## User Stories

1. Utilizatorul isi poate face un cont nou (va introduce datele necesare (email, parola) si va primi un mail de confirmare)
2. Utilizatorul se poate loga/deloga sau pooate sa-si schimbe parola.
3. Odata logat, poate cauta membri si grupuri print-un meniu de search.
4. Poate vedea conversatiile si grupurile din care face parte.
5. Poate trimite mesaje text sau fisiere, care vor fi vazute in timp real de catre ceilalti participantii.
6. Posibilitate de search in conversatii.
7. Sa salveze un mesaj in sectiunea de “importante”, sau cu tag.
8. Sa poata da reply la un mesaj.
9. Sa poata sterge un mesaj de-al lui.
10. Recuperare cont in caz ca utilizatorul uita parola

## Running the server

Make sure you have [poetry](https://python-poetry.org/) installed, after that:
```sh
cd backend/

poetry install

../scripts/run.sh
```
Once the server is running you can open [client/index.html](client/index.html) in a browser and the connection should
be established.


## Schema db
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

