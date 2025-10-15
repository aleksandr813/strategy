**users**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| login | varchar(50) | unique not null |
| password | varchar(255) | not null |
| name | varchar(100) | not null |
| token | varchar(255) | |
| money | integer | 100 by default |


**villages**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| user_id | integer | not null |
| x | integer | not null |
| y | integer | not null |
| last_income_datetime | datetime | now() |


**bulding_types**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| type | varchar(100) | 'mine', 'ratusha', 'tower', 'wall' |
| name | varchar(100) | not null |
| hp | integer | 1 by default |
| price | integer | not null |
| income | integer | 100 by default | 
| income_interval | integer | 1800 by default | 


**buldings**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| type_id | integer | not null |
| village_id | integer | not null |
| x | integer | not null |
| y | integer | not null |
| level | integer | not null | 1 by default |
| current_hp | integer | not null |
| last_income_time | integer | 0 by default | 



**unit_types**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| type | varchar(100) | not null |
| name | varchar(100) | not null |
| hp | integer | 1 by default |
| price | integer | not null |


**units**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| type_id | integer | not null |
| village_id | integer | not null |
| x | integer | not null |
| y | integer | not null |
| level | integer | not null | 1 by default |
| current_hp | integer | not null |


**messages**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| user_id | integer | not null |
| message | text | not null |
| created | timestamp | not null | now() |


**hashes**
| name | type | comment |
|-|-|-|
| id | integer | primary key |
| chat_hash | text | not null |


