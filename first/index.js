const { Configuration, OpenAIApi } = require("openai");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');
const fs_write = require('fs').promises;
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
max_parrel = 15;
freq = 2500;
all_result = [];
current_key = '';
index = 1;
let result = [];
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function runCompletion(str, i) {
    try {
        let strquery = []
        for (x in str)
            strquery.push(str[x].q);
        let resfromBot = []
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: strquery,
        });
        let oldkey = '';
        for (h = 0; h < completion.data.choices.length; h++) {
            let oncequery = completion.data.choices[h].text;
            if (oncequery.includes('None')) oncequery = '\n\nNone';
            let item = {
                key: oncequery,
                value: str[h].value
            }
            resfromBot.push(item);
            if (oldkey != oncequery) {
                oldkey = oncequery;
                console.log(oncequery);
            }
            console.log(str[h].value);
        }
        result = result.concat(resfromBot);
        console.log(i);
    } catch (error) {
        console.log("Network error!");
    }

}
const askToDavinci = (query, i) => {
    (async () => {
        await runCompletion(query, i)
    })()
}
const mergeArray = (oper1) => {
    const groupeArray = oper1.reduce((acc, item) => {
        const key = item.key;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item.value);
        return acc;
    }, {});
    return groupeArray;
}
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'data'}
    ]
});


async function testGetData() {
    try {
        const sitappList = await getsiteappList("uncat.csv");
        const categoryList = await getcategoryList("Categories.csv");
        sub_query = "'" + categoryList[0].purpose_level + "'";
        for (i = 1; i < categoryList.length; i++) {
            sub_query += ", '" + categoryList[i].purpose_level + "'";
        }
        query = "";
        strToBot = [];
        for (i = 0; i < sitappList.length; i++) {
            if(i==5)console.log(query);
            query = "Which of these  " + sub_query + "  is the best fit for '" + sitappList[i].site + "' ?";
            let item = {
                q: query,
                value: sitappList[i].site
            }
            strToBot.push(item);
            if ((i % max_parrel == 0) && (i > 0)) {
                curstatus = String(i) + '/' + String(sitappList.length);
                askToDavinci(strToBot, curstatus);
                strToBot = [];
                await new Promise(resolve => setTimeout(resolve, freq));
            }
        }
        console.log("-----------------------------------");
        const obj = mergeArray(result);
        let list = [];
        for (x in obj) {
            let item={
                data:x
            }
            list.push(item);
            q = obj[x];
            for (y in q) {
                let item={
                    data:q[y]
                }
                list.push(item);
            }
        }

        csvWriter
            .writeRecords(list)
            .then(() => console.log('The CSV file was written successfully'));

    } catch (error) {
        console.error("out.csv written error occurred: ", error.message);
    }
}
testGetData();



