# Daily Digest Grabber

This tool allows the automation of reading your daily digest articles sent to your mailbox

### Prerequisites

* [Node.js](https://nodejs.org/en/download/) - JavaScript runtime
* [Google Chrome](https://www.google.com/chrome/) - Web Browser

### Step One - Installation

Install project dependencies

```shell
npm install
```

### Step Two - Create Environment file
##### UNIX

```shell
cp .env.tmpl .env
```
##### Windows

```shell
copy .env.example .env
```

### Step Three - Update Environment file
Update env file with Gmail Login Credentials and path to Chrome executable file

```shell
USERNAME = GMAILUSERNAME
PASSWORD = GMAILPASSWORD 
CHROME_EXEC_PATH = PATH TO CHROME APP
```

### Step Four - Run App

```shell
node app.js
```
 

## Contributing

If you find an issue or want to contribute please send in a PR.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
