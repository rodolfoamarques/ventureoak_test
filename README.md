# PIG LATIN RESTFUL TRANSLATOR API



## Objective:

Users can translate text to Pig Latin.

Create a REST Api that:
* Handles Registration ( Confirmation needed )
* Authentication And Authorization
* Receives content and Translate it to Pig Latin ( save this resource to be fetch )
  > ex:  POST /posts  , GET /posts/1  <-- content should be translated to Pig Latin.


## Requirements:

* Only authenticated users ( active ) can post content to be translated
* At least an 85% test coverage
* Any database can be used ( even in memory )
* An beautiful algorithm for the Pig Latin translation.
* Be RESTFUL
* Provide simple client for accessing the API or Curl request / Postman etc.



## Pig Latin System

Basically, the Pig Latin system used here works as follows:

* Words that start with a vowel (A, E, I, O, U) simply have "WAY" appended to the end of the word.
* Words that start with a consonant have all consonant letters up to the first vowel moved to the end of the word (as opposed to just the first consonant letter), and "AY" is appended. ('Y' is counted as a vowel in this context)
* The algorithm incorporates the following features and special case functionality:
  * Ensures proper capitalization
  * Correct upper case and lower case formatting
  * Correctly translates "qu" (e.g., ietquay instead of uietqay)
  * Correctly translates contractions
  * Hyphenated words are treated as two words
  * Words may consist of alphabetic characters only (A-Z and a-z)
  * All punctuation, numerals, symbols and whitespace are not modified
  * Differentiates between "Y" as vowel and "Y" as consonant
    (e.g. yellow = elloyay and style = ylestay) — except for a very few exceptions



## Versions

```
$ node -v
v6.9.1

$ npm -v
4.5.0

$ nvm -v
Running version 1.1.1.
```

Developed on Windows OS



## Installation

#### Prerequisites

  1. This repo assumes you have a node.js environment ready, preferably with the previously described versions of npm and node.

  2. Some necessary global npm packages:
    ```
    $ npm install -g sequelize sequelize-cli pg
    ```

    Versions at time of development:
    ```
    > npm ls -g --depth=0

    C:\nvm\NodeJS
    +-- pg@6.1.4
    +-- sequelize@3.30.2
    `-- sequelize-cli@2.6.0
    ```

  3. You also need to setup a PostgreSQL environment and initialize the following:
    > open a connection to the database: `sudo -u postgres psql postgres`
    > create a database named "ventureoak_dev": `CREATE DATABASE ventureoak_dev; CREATE EXTENSION unaccent; CREATE EXTENSION postgis;`
    > setup a user named: "root" with password "root_pass": `CREATE USER root WITH PASSWORD 'root_pass';`
    > grant access to database "ventureoak_dev" to user "root": `GRANT ALL PRIVILEGES ON DATABASE ventureoak_dev TO root;`
    >
    > If you already have your environment setup and want another username/password, simply update the file "config/database.json".

#### Getting started

1. To get started, clone the repo, `cd` into it and then install the dependencies:
  ```
  $ npm install
  ```

  Versions at time of development:
  ```
  > npm ls --depth=0

  ventureoak_test@1.0.0 ./ventureoak_test
  +-- akaya@2.1.3
  +-- bcrypt@1.0.2
  +-- bissle@1.2.3
  +-- boom@4.3.1
  +-- code@4.0.0
  +-- final-fs@1.6.1
  +-- hapi@16.1.1
  +-- hapi-auth-jwt2@7.2.4
  +-- hapi-route-acl@1.0.3
  +-- hapi-swaggered@2.9.0
  +-- hapi-swaggered-ui@2.6.0
  +-- inert@4.2.0
  +-- istanbul@0.4.5
  +-- joi@10.4.1
  +-- jsonwebtoken@7.4.0
  +-- lab@13.0.2
  +-- moment@2.18.1
  +-- pg@6.1.5
  +-- sequelize@3.30.4
  +-- sequelize-cli@2.7.0
  `-- vision@4.1.1
  ```

2. Next, migrate the database (this step assumes you already created an empty database called "ventureoak_dev"):
  ```
  $ sequelize db:migrate
  $ sequelize db:seed:all
  ```

3. Finally, run the test suite to verify that everything is working correctly:
  ```
  $ npm test
  ```

4. If the test suite passes, you'll be ready to run the API in a local server:
  ```
  $ npm start
  ```

5. Visualize the API documentation on: [http://localhost:3666/](http://localhost:3666/docs). This will allow you to easily see what routes are available, what information each route requires and to manually test and interact with the API. If you wish, feel free to access each route separately by their address in the browser (for example [http://localhost:3666/payslip](http://localhost:3666/payslip)) but remember this is an 'API only' project. No front-end whatsoever was developed and all route returns will be in a JSON object.

6. As a friendly reminder, you can use the credentials `demo1@mail.com`, `demo2@mail.com` or `demo3@mail.com` with the password `password` to authenticate. For details on permissions, please refer to the database's seed file [pre_populate_db](database/seeders/20170202021739-pre_populate_db.js).



## Latest test results

```
> npm test

> ventureoak_test@1.0.0 test ./ventureoak_test
> node node_modules/lab/bin/lab -cv -m 10000

[ 'initialize' ] moment("2017-04-24T21:23:39.830")
[ 'initialize' ] 'Server running'
[ 'initialize' ] 'API at: http://127.0.0.1:3666'

Authentication Endpoint
  √ 1) POST login - user (156 ms)
  √ 2) POST login - admin (99 ms)
  √ 3) POST login - super admin (93 ms)
  √ 4) POST login - invalid credentials (non-existing email) (8 ms)
  √ 5) POST login - invalid credentials (email must be a valid email address) (6 ms)
  √ 6) POST login - invalid credentials (email must be a valid email address) (2 ms)
  √ 7) POST login - invalid credentials (email must be a valid email address) (5 ms)
  √ 8) POST login - invalid credentials (email must be a valid email address) (6 ms)
  √ 9) POST login - invalid credentials (email must be a valid email address) (4 ms)
  √ 10) POST login - missing credentials (no email) (2 ms)
  √ 11) POST login - invalid credentials (wrong password) (89 ms)
  √ 12) POST login - missing credentials (no password) (10 ms)
  √ 13) POST login - disabled user (13 ms)
  √ 14) POST register new user (103 ms)
  √ 15) POST new user with forbidden keys - part 1 (forbidden: id) (2 ms)
  √ 16) POST new user with forbidden keys - part 2 (forbidden: role_id) (2 ms)
  √ 17) POST new user with forbidden keys - part 3 (forbidden: enabled) (7 ms)
  √ 18) POST new user with forbidden keys - part 4 (forbidden: last_login_at) (2 ms)
  √ 19) POST new user with forbidden keys - part 5 (forbidden: created_at) (6 ms)
  √ 20) POST new user with forbidden keys - part 6 (forbidden: updated_at) (7 ms)
  √ 21) POST new user with forbidden keys - part 7 (forbidden: deleted_at) (3 ms)
  √ 22) POST new user with extra information (extra: non_existing_key) (6 ms)
  √ 23) POST new user with missing data - part 1 (email missing) (3 ms)
  √ 24) POST new user with missing data - part 2 (password missing) (7 ms)
  √ 25) POST new user with missing data - part 3 (password_confirmation missing) (2 ms)
  √ 26) POST new user with invalid data - part 1.0 (email must be a valid email address) (3 ms)
  √ 27) POST new user with invalid data - part 1.1 (email must be a valid email address) (3 ms)
  √ 28) POST new user with invalid data - part 1.2 (email must be a valid email address) (5 ms)
  √ 29) POST new user with invalid data - part 1.3 (email must be a valid email address) (3 ms)
  √ 30) POST new user with invalid data - part 1.4 (email must be a valid email address) (2 ms)
  √ 31) POST new user with invalid data - part 1.5 (email must be unique) (12 ms)
  √ 32) POST new user with invalid data - part 2 (full_name must be a string) (2 ms)
  √ 33) POST new user with invalid data - part 3.0 (password_confirmation must be a string) (9 ms)
  √ 34) POST new user with invalid data - part 3.1 (password must be a string) (4 ms)
  √ 35) POST new user with invalid data - part 3.2 (password must be equal to password_confirmation) (10 ms)
Roles Endpoint
  √ 36) GET all roles - no authorization header (6 ms)
  √ 37) GET all roles - invalid authorization token (5 ms)
  √ 38) GET all roles - unauthorized user (16 ms)
  √ 39) GET all roles - authorized user (20 ms)
  √ 40) GET specific role (19 ms)
  √ 41) GET specific role - non-existing role (18 ms)
  √ 42) GET specific role - zero ID role (22 ms)
  √ 43) GET specific role - negative ID role (7 ms)
  √ 44) POST new role - no authorization header (2 ms)
  √ 45) POST new role - invalid authorization token (5 ms)
  √ 46) POST new role - unauthorized role (5 ms)
  √ 47) POST new role - authorized role (29 ms)
  √ 48) POST new role - forbidden key (id) (36 ms)
  √ 49) POST new role - forbidden key (created_at) (9 ms)
  √ 50) POST new role - forbidden key (updated_at) (10 ms)
  √ 51) POST new role - forbidden key (deleted_at) (10 ms)
  √ 52) POST new role - extra key (non_existing_key) (10 ms)
  √ 53) POST new role - missing key (name) (10 ms)
  √ 54) POST new role - missing key (permissions) (16 ms)
  √ 55) POST new role - invalid data (name must be a string) (10 ms)
  √ 56) POST new role - invalid data (name must be a unique) (13 ms)
  √ 57) PUT to existing role - no authorization header (8 ms)
  √ 58) PUT to existing role - invalid authorization token (10 ms)
  √ 59) PUT to existing role - unauthorized role (17 ms)
  √ 60) PUT to existing role - authorized role (27 ms)
  √ 61) PUT to existing role - forbidden key (id) (14 ms)
  √ 62) PUT to existing role - forbidden key (created_at) (19 ms)
  √ 63) PUT to existing role - forbidden key (updated_at) (20 ms)
  √ 64) PUT to existing role - forbidden key (deleted_at) (16 ms)
  √ 65) PUT to existing role - extra key (non_existing_key) (19 ms)
  √ 66) PUT to existing role - invalid data (name must be a string) (13 ms)
  √ 67) PUT to existing role - invalid data (name must be unique) (29 ms)
  √ 68) DELETE specific role - no authorization header (10 ms)
  √ 69) DELETE specific role - invalid authorization token (6 ms)
  √ 70) DELETE specific role - unauthorized role (15 ms)
  √ 71) DELETE specific role - authorized role (18 ms)
  √ 72) DELETE specific role - non-existing role (10 ms)
  √ 73) DELETE specific role - zero ID role (7 ms)
  √ 74) DELETE specific role - negative ID user (8 ms)
Pig Latin Translation
  √ 75) Word Translation (4 ms)
  √ 76) Sentence Translation (1 ms)
Translations Endpoint
  √ 77) GET all translations - no authorization header (1 ms)
  √ 78) GET all translations - invalid authorization token (2 ms)
  √ 79) GET all translations - unauthorized user (10 ms)
  √ 80) GET all translations - authorized user (11 ms)
  √ 81) GET specific translation (16 ms)
  √ 82) GET specific translation - non-existing translation (9 ms)
  √ 83) GET specific translation - zero ID translation (9 ms)
  √ 84) GET specific translation - negative ID translation (5 ms)
  √ 85) POST new translation - no authorization header (4 ms)
  √ 86) POST new translation - invalid authorization token (2 ms)
  √ 87) POST new translation - unauthorized user (10 ms)
  √ 88) POST new translation - authorized user (26 ms)
  √ 89) POST new translation - forbidden key (id) (7 ms)
  √ 90) POST new translation - forbidden key (piglatin_text) (13 ms)
  √ 91) POST new translation - forbidden key (created_at) (12 ms)
  √ 92) POST new translation - forbidden key (updated_at) (4 ms)
  √ 93) POST new translation - forbidden key (deleted_at) (17 ms)
  √ 94) POST new translation - extra key (non_existing_key) (13 ms)
  √ 95) POST new translation - missing key (english_text) (11 ms)
  √ 96) POST new translation - invalid data (english_text must be a string) (9 ms)
Users Endpoint
  √ 97) GET all users - no authorization header (2 ms)
  √ 98) GET all users - invalid authorization token (2 ms)
  √ 99) GET all users - unauthorized user (6 ms)
  √ 100) GET all users - authorized user (18 ms)
  √ 101) GET specific user (23 ms)
  √ 102) GET specific user - non-existing user (14 ms)
  √ 103) GET specific user - zero ID user (7 ms)
  √ 104) GET specific user - negative ID user (13 ms)
  √ 105) POST new user - no authorization header (5 ms)
  √ 106) POST new user - invalid authorization token (2 ms)
  √ 107) POST new user - unauthorized user (6 ms)
  √ 108) POST new user - authorized user (103 ms)
  √ 109) POST new user - forbidden key (id) (9 ms)
  √ 110) POST new user - forbidden key (enabled) (6 ms)
  √ 111) POST new user - forbidden key (last_login_at) (8 ms)
  √ 112) POST new user - forbidden key (created_at) (13 ms)
  √ 113) POST new user - forbidden key (updated_at) (13 ms)
  √ 114) POST new user - forbidden key (deleted_at) (9 ms)
  √ 115) POST new user - extra key (non_existing_key) (13 ms)
  √ 116) POST new user - missing key (email) (10 ms)
  √ 117) POST new user - missing key (role_id) (14 ms)
  √ 118) POST new user - missing key (password_confirmation) (19 ms)
  √ 119) POST new user - missing key (password) (11 ms)
  √ 120) POST new user - invalid data (email must be a string) (8 ms)
  √ 121) POST new user - invalid data (email must be a valid email address) v1 (10 ms)
  √ 122) POST new user - invalid data (email must be a valid email address) v2 (8 ms)
  √ 123) POST new user - invalid data (email must be a valid email address) v3 (10 ms)
  √ 124) POST new user - invalid data (email must be a valid email address) v4 (13 ms)
  √ 125) POST new user - invalid data (email must be unique) (44 ms)
  √ 126) POST new user - invalid data (role_id must be a number) (11 ms)
  √ 127) POST new user - invalid data (role_id must be an integer) (8 ms)
  √ 128) POST new user - invalid data (role_id must be an integer larger than or equal to 1) v1 (11 ms)
  √ 129) POST new user - invalid data (role_id must be an integer larger than or equal to 1) v2 (6 ms)
  √ 130) POST new user - invalid data (role_id must be a valid reference) (13 ms)
  √ 131) POST new user - invalid data (full_name must be a string) (10 ms)
  √ 132) POST new user - invalid data (password_confirmation must be a string) (6 ms)
  √ 133) POST new user - invalid data (password must be a string) (13 ms)
  √ 134) POST new user - invalid data (password must be equal to password_confirmation) (17 ms)
  √ 135) PUT to existing user - no authorization header (10 ms)
  √ 136) PUT to existing user - invalid authorization token (6 ms)
  √ 137) PUT to existing user - unauthorized user (16 ms)
  √ 138) PUT to existing user - authorized user (34 ms)
  √ 139) PUT to existing user - forbidden key (id) (20 ms)
  √ 140) PUT to existing user - forbidden key (created_at) (16 ms)
  √ 141) PUT to existing user - forbidden key (updated_at) (16 ms)
  √ 142) PUT to existing user - forbidden key (deleted_at) (22 ms)
  √ 143) PUT to existing user - extra key (non_existing_key) (27 ms)
  √ 144) PUT to existing user - invalid data (email must be a string) (17 ms)
  √ 145) PUT to existing user - invalid data (email must be a valid email address) v1 (13 ms)
  √ 146) PUT to existing user - invalid data (email must be a valid email address) v2 (18 ms)
  √ 147) PUT to existing user - invalid data (email must be a valid email address) v3 (15 ms)
  √ 148) PUT to existing user - invalid data (email must be a valid email address) v4 (19 ms)
  √ 149) PUT to existing user - invalid data (email must be a valid email address) v5 (15 ms)
  √ 150) PUT to existing user - invalid data (email must be unique) (44 ms)
  √ 151) PUT to existing user - invalid data (role_id must be a number) (39 ms)
  √ 152) PUT to existing user - invalid data (role_id must be an integer) (10 ms)
  √ 153) PUT to existing user - invalid data (role_id must be an integer larger than or equal to 1) v1 (14 ms)
  √ 154) PUT to existing user - invalid data (role_id must be an integer larger than or equal to 1) v2 (51 ms)
  √ 155) PUT to existing user - invalid data (role_id must be a valid reference) (14 ms)
  √ 156) PUT to existing user - invalid data (full_name must be a string) (12 ms)
  √ 157) PUT to existing user - invalid data (password_confirmation must be a string) (14 ms)
  √ 158) PUT to existing user - invalid data (password must be a string) (15 ms)
  √ 159) PUT to existing user - invalid data (password must be equal to password_confirmation) (23 ms)
  √ 160) DELETE specific user - no authorization header (10 ms)
  √ 161) DELETE specific user - invalid authorization token (4 ms)
  √ 162) DELETE specific user - unauthorized user (14 ms)
  √ 163) DELETE specific user - authorized user (33 ms)
  √ 164) DELETE specific user - non-existing user (10 ms)
  √ 165) DELETE specific user - zero ID user (12 ms)
  √ 166) DELETE specific user - negative ID user (6 ms)


166 tests complete
Test duration: 3677 ms
No global variable leaks detected
Coverage: 93.79% (71/1143)
index.js missing coverage on line(s): 11
api/index.js missing coverage on line(s): 14, 62, 66, 67, 73, 79, 87, 88, 93, 102
api/System/Authentication/controller.js missing coverage on line(s): 54, 56, 99, 101
api/System/SystemRoles/controller.js missing coverage on line(s): 26, 31, 35, 36, 54, 56, 68, 69, 70, 89, 91, 104, 105, 112, 121, 132, 134, 153, 155
api/Translate/controller.js missing coverage on line(s): 16, 18, 36, 37, 38, 51, 52, 53, 72, 74
api/Users/controller.js missing coverage on line(s): 55, 57, 69, 70, 71, 90, 92, 105, 106, 113, 122, 128, 134, 140, 149, 160, 162, 181, 183
database/models/index.js missing coverage on line(s): 9, 14, 15, 23, 37, 38
helpers/jwt_helper.js missing coverage on line(s): 20, 21
```




## Assumptions

* FrontEnd
  > Since I use swagger for documentation and manual testing of each API route, I saved some effort and did not develop any kind of FrontEnd interface. Swagger usually provides a simple yet good enough interface to interact with the API routes, but if FontEnd is also a requirement, please do give a description of what be acceptable and allow me a couple more days to complete it.

* Translation requirement: "Correct upper case and lower case formatting"
  > This is ensured by never modifying the original world, besides adding the suffix or moving the first consonants to the end and then adding the suffix. The suffix is always lowercase. This means that any capitalized letter stays capitalized and any lowercase letter stays lowercase (eg. 'house' is translated to 'ousehay', 'hoUSe' is translated to 'oUSehay'). The only exception to this is when the word has the first letter capitalized, which transforms the letter to lowercase and capitalizes the first letter of the translated word (eg. 'House' is translated to 'Ousehay')

* Compound words and Hyphenated words
  > Hyphenated word handling is required by the exercise. The approach taken was to utilize a dictionary created through [Wikipedia's List of contractions](https://en.wikipedia.org/wiki/Wikipedia:List_of_English_contractions). For ambiguous contractions like "he's" (which could mean for example "he is" or "he was" or "he has"), a default translation was selected at random. A more robust algorithm could interpret the text and select the appropriate expansion.

  > Compound word handling is not required by the exercise, but most Pig Latin resources mention they should be handled to increase complexity. This functionality was added to the translate_text() function with the same dictionary approach, based on [Many Thing's Compound Word List](http://www.manythings.org/vocabulary/lists/a/words.php?f=compound_words).

  > It is worth to note that I do not consider these dictionaries to be exhaustive or completely reliable/accurate. Many of the represented contractions or compound words are or may be in linguistic grey areas filled with controversy and debate. They serve the purpose of demonstration and would require an in-depth study of the English language to be fit for a production application.

* Authentication / Authorization system
  > The implemented authentication/authorization system is based on JWT. When a registered user logs in with valid credentials, an encrypted token is issued, based on the id of the user and the expiration date (12h after the login request). It is assumed that the FrontEnd will ensure the storage of this token and use it in each request to the API. This approach assumes that it is the responsibility of the FrontEnd to destroy/clean the storage to invalidate the token and thus no logout route is implemented in the API.
