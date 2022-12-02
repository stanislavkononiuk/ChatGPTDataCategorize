const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');

const getsiteappList = (inputfile) => {
    let tmp = []
    return new Promise((resolve, reject) => {
        fs.createReadStream(inputfile)
            .pipe(csv())
            .on('data', (row) => {
                tmp.push(row);
            })
            .on('end', () => {
                resolve(tmp);
            });
    })

}

const getcategoryList = (inputfile) => {
    let tmp = []
    return new Promise((resolve, reject) => {
        fs.createReadStream(inputfile)
            .pipe(csv())
            .on('data', (row) => {
                tmp.push(row);
            })
            .on('end', () => {
                resolve(tmp);
            });
    })

}


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function runCompletion(str) {
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: str,
    });
    // return completion.data.choices[0].text.substring(2, 3);
    return completion.data.choices;
}


// runCompletion("Is this 'goibibo.com' website for Business?");

const askToDavinci = (query) => {
    (async () => {
        console.log(await runCompletion(query))
    })()
}

async function testGetData() {
    try {
        const sitappList = await getsiteappList("uncat.csv");
        const categoryList = await getcategoryList("Categories.csv");
        for (i = 0; i < categoryList.length; i++) {
            j = 0;
            strToBot = [];
            while (j < sitappList.length) {
                query = "If '" + sitappList[j].site + "' is for " + categoryList[i].purpose + " , please answer whether it is for '" + categoryList[i].level + "' with yes or no.";
                strToBot.push(query);
                if (j % 20 == 0) {
                    // setTimeout(() => {
                    //     askToDavinci(strToBot);
                    //   }, "1000");
                    // strToBot = [];
                }
                j++;
            }
        }
    } catch (error) {
        console.error("uncat.csv error occurred: ", error.message);
    }
}

testGetData();
// askToDavinci("Please answer whether 'teams.microsoft.com' is for Communication & Scheduling with yes or no.");   


for (i = 0; i < 20; i++) {
    str = ["If 'dwighth.studio.cam' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'pioneerdj.com' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Elevate UC 2.8.343.0.4.454-20220830.1312.release.2022.08.29' is for Business , please answer whether it is for 'General' with yes or no.",
        "If '192.168.1.19' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Elevate UC 2.8.20.0.4.454-20220610.1436.release.2022.06.08' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'webreport.hj.sanno.ac.jp' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'myperfectcv.co.uk' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'target.com.au' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'secura.net' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'dwdashboard.pfw.edu' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'tms.test' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Instellingen' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Quick Bid 4 4.99.5.14' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Pages' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'iiroc.ca' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'gpi.explainsafe.nl' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'N-able Take Control 7.0.35.1135' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'carriers.carecorenational.com' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'secure.tracksideprereg.com' is for Business , please answer whether it is for 'General' with yes or no.",
        "If 'Brave Browser 109.1.47.171' is for Business , please answer whether it is for 'General' with yes or no."];    
    setTimeout(() => {
        askToDavinci(str);
      }, "2000");
}







