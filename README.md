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
4.1.1

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

    // versions at time of development:
    // C:\Programing\nvm\NodeJS
    // +-- pg@6.1.2
    // +-- sequelize@3.27.0
    // `-- sequelize-cli@2.5.1
    ```

  3. You also need to setup a PostgreSQL environment and initialize the following:
    > create a database named: ventureoak_dev
    > setup a user named: root
    > with the password: root_pass
    > grant access to database "ventureoak_dev" to user "root"
    >
    > If you already have your environment setup and want another username/password, simply update the file "config/config.json".

#### Getting started

1. To get started, clone the repo, `cd` into it and then install the dependencies:
  ```
  $ npm install
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



## Assumptions

* FrontEnd
  > Since I use swagger for documentation and manual testing of each API route, I saved some effort and did not develop any kind of FrontEnd interface. Swagger usually provides a simple yet good enough interface to interact with the API routes, but if FontEnd is also a requirement, please do give a description of what be acceptable and allow me a couple more days to complete it.
