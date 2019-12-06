require('dotenv').config();
module.exports =  {
    config: {
        pageUrl: "https://www.gmail.com/",
        waitUntil: 'networkidle0',
        chromePath : process.env.CHROME_EXEC_PATH
    },
    credentials : {
        'username' : process.env.USERNAME,
        'password' : process.env.PASSWORD
    },
    supportedDigests: {
        'Quora Digest' : true
    }
};
