[![StaticAnalysis](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml)
[![Testing](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml)
---
# Real Time Messaging

## Membrii
* Gherghina Roxana-Ioana (231)
* Ica Alexandru-Gabriel (232)
* Arsene Marinel (233)
* Cioarec George (233)
* Tudose Mihai-Cristian (233)


## Ce face aplicatia?
Inspirata de modelul de WhatsApp si Discord, in aplicatia noastra clientul poate sa isi creeze cont, sa trimita mesaje in timp real si sa caute useri cu care sa inceapa conversatii. 

## User Stories

1. Utilizatorul isi poate face un cont nou: va introduce datele necesare (email, parola) si va primi un mail de confirmare.
2. Utilizatorul se poate loga/deloga.
3. Odata logat, poate cauta membri print-un meniu de search.
4. Poate vedea conversatiile din care face parte.
5. Poate trimite mesaje text care vor fi vazute in timp real de catre ceilalti participantii.
6. Poate trimite fisiere in timp real, care pot fi descarcate de catre destinatar. (partial)
7. Sa salveze un mesaj in sectiunea de “importante”. (partial)
8. Sa poata sterge un mesaj de-al lui. (partial)
9. Sa poata da reply la un mesaj. *
10. Sa poata cauta mesaje in conversatie. *
11. Recuperare cont in caz ca utilizatorul uita parola. *

\* aceste cerinte nu au fost implementate


## Backlog

Backlogul se afla [aici](https://github.com/AlexandruIca/MDS/projects/1) 

## UML

Cum functioneaza conceptual?
![Diagrama aici](./media/UML_MDS.pdf)
Cum comunica clientul cu serverul?

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

