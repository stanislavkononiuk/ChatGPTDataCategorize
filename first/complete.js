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

max_parrel=10;
freq=5000;
all_result=[];
current_key='';
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function runCompletion(str) {
    strquery = []
    for(x in str)
        strquery.push(str[x].q);
    // console.log(strquery)
    resfromBot=[]
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: strquery,
    });
    // return completion.data.choices[0].text.substring(2, 3);
    for(h=0;h<completion.data.choices.length;h++){
        replyfromBot=completion.data.choices[h].text.substring(2, 3);
        resfromBot.push(replyfromBot);
        if(replyfromBot=="Y"){
            if(current_key!==str[h].key){
                console.log(str[h].key);
                current_key=str[h].key;
            }
            console.log(str[h].value);
            // console.log(str[h].key,str[h].value);
            let item={
                key:str[h].key,
                value:str[h].value
            }
            all_result.push(item);
        }
    }
    return resfromBot;
}

const askToDavinci = (query) => {
    (async () => {
        // console.log(await runCompletion(query));
        await runCompletion(query)
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
                let item={
                    q:query,
                    key:categoryList[i].purpose_level,
                    value:sitappList[j].site
                }
                strToBot.push(item);
                if ((j % max_parrel == 0)&&(j>0)) {
                    askToDavinci(strToBot);
                    strToBot = [];
                    await new Promise(resolve => setTimeout(resolve, freq));
                }
                j++;
            }
        }
    } catch (error) {
        console.error("uncat.csv error occurred: ", error.message);
    }
}

testGetData();






