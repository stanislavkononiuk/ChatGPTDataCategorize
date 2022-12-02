const { Configuration, OpenAIApi } = require("openai");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const mycsvWriter = require('csv-write-stream');
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');
const { version } = require("os");
const fs_write = require('fs').promises;
const getsiteappList = (inputfile) => {
    let tmp = [];
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
    let tmp = [];
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
            if (oncequery.includes('None')) oncequery = '\n\Uncategorized-Uncategorized';
            let item = {
                key: oncequery,
                value: str[h].value,
                actionType: str[h].actionType
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
        let ele = {
            val: item.value,
            type: item.actionType
        }
        acc[key].push(ele);
        return acc;
    }, {});
    return groupeArray;
}
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'Activity(app or site' },
        { activityType: 'ActivityType(0-app, 1-website)' },
        { cid: 'CategoryID' },
        { p_name: 'Parent_name' },
        { c_name: 'Category_name' },
        { f_name: 'Full_name' },
    ]
});
const uncateliminate = createCsvWriter({
    path: 'uncat-elim.csv',
    header: [
        { site: 'site' },
        { type: 'type' }
    ]
})
const versioncompare = (oper1, oper2) => {
    let ai = 0;
    oper1 = oper1.toString();
    let bi = 0;
    oper2 = oper2.toString();
    if (oper1.indexOf(".") == -1) {
        ai = oper1.length;
    }
    else {
        ai = oper1.indexOf(".");
    }
    if (oper2 == '0') return 1;
    if (oper2.indexOf(".") == -1) {
        bi = oper2.length;
    }
    else {
        bi = oper2.indexOf(".");
    }
    let a = parseInt(oper1.substring(0, ai));
    let b = parseInt(oper2.substring(0, bi));
    if (a > b)
        return 1;
    else {
        if (a == b) {
            let ci = 0;
            let di = 0;
            if (oper1.indexOf(".", ai + 1) == -1) {
                ci = oper1.indexOf(".", oper1.length);
            }
            else {
                ci = oper1.indexOf(".", ai + 1);
            }

            if (oper2.indexOf(".", bi + 1) == -1) {
                di = oper2.indexOf(".", oper2.length);
            }
            else {
                di = oper2.indexOf(".", bi + 1);
            }
            let c = parseInt(oper1.substring(ai + 1, ci));
            let d = parseInt(oper2.substring(bi + 1, di));
            if (c > d) {
                return 1;
            }
            else return 0;
        }
        else return 0;
    }

}
const isApp = (str) => {
    let app_versions = '';
    let app_name = '';
    let cur = 0;
    str = str.split(" ").join("").toLowerCase()
    versionmas=str.indexOf("release");
    searchstart=str.length-1;
    if(versionmas>0)searchstart=versionmas-1;
    for (j = searchstart; i > 0; j--) {
        if (!(parseInt(str[j]) >= 0 || str[j] == '.'|| str[j] == ' '|| str[j] == '-'|| str[j] == '?'|| str[j] == 'V'|| str[j] == 'v'|| str[j] == 'b')) { cur = j; break; }
    }
    if(cur!=0){
        app_name = str.substring(0, cur+1);
        app_versions=str.substring(cur+1,str.length);
        console.log(str,'---------', app_name,'-------',app_versions);
    }
    










    // if (app_versions.indexOf(".") == 0) app_versions = app_versions.substring(1, app_versions.length - 1);
    let result = {
        name: '',
        app_version: ''
    }
    // if (app_versions != '') {
    //     app_name = str.split(" ").join("").toLowerCase().replace(/[0-9,.]/g, '');
    //     result.name = app_name;
    //     result.app_version = app_versions;
    //     console.log(str, result);
        
    // }
    return result;
}
const dupelementary = (arr) => {
    let str_arr = [];
    let version_arr = [];
    let versions;
    let elilist = [];
    for (i = 0; i < arr.length; i++) {
        let tmp = arr[i]._0;
        if (tmp != undefined) {
            let result = isApp(tmp);
            if (result.app_version != '') {
                let idx = str_arr.indexOf(result.name);
                if (idx != -1) {
                    if (versioncompare(result.app_version, version_arr[idx])) {
                        version_arr[idx] = result.app_version;
                        arr[idx] = arr[i];
                    }
                    version_arr[i] = 0;
                    elilist.push(i);
                }
                else {
                    version_arr[i] = result.app_version;
                }
                str_arr[i] = result.name;
                arr[i]._0 = result.name;
            }
        }
    }
    console.log(elilist);
}
let categoryList = [];
const getCid = (str) => {
    for (item in categoryList) {
        if (item.id == x) return item.id;
    }
}
async function testGetData() {
    try {
        const sitappList = await getsiteappList("out.csv");
        dupelementary(sitappList);

    } catch (error) {
        console.error("out.csv written error occurred: ", error.message);
    }
}
testGetData();

