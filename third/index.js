const { Configuration, OpenAIApi } = require("openai");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const mycsvWriter = require('csv-write-stream');
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');
const { version, type } = require("os");
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
                // console.log(oncequery);
            }
            // console.log(str[h].value);
        }
        result = result.concat(resfromBot);
        // console.log(i);
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
const writeresult = createCsvWriter({
    path: 'result.csv',
    header: [
        { id:'a', title: 'Activity(app or site)' },
        { id:'b', title: 'ActivityType(0 - app, 1 - website)' },
        { id:'c', title: 'CategoryID' },
        { id:'d', title: 'Parent_name' },
        { id:'e', title: 'Category_name' },
        { id:'f', title: 'Full_name' }
    ]
});
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
// const dupelementary = (arr) => {
//     let str_arr = [];
//     let version_arr = [];
//     let versions;
//     let elilist = [];
//     for (i = 0; i < arr.length; i++) {
//         if (arr[i].type == 0) {
//             let tmp = arr[i].site;
//             str = tmp.split(" ").join("").toLowerCase().replace(/[0-9,.]/g, '');
//             versions = tmp.split(" ").join("").toLowerCase().replace(/[a-z,_,-]/g, '').replace('-', '.');
//             if (versions.indexOf(".") == 0) versions = versions.substring(1, versions.length - 1);
//             if (versions != '') {
//                 let idx = str_arr.indexOf(str);
//                 if (idx != -1) {
//                     if (versioncompare(versions, version_arr[idx])) {
//                         version_arr[idx] = versions;
//                         arr[idx] = arr[i];
//                     }
//                     version_arr[i] = 0;
//                     elilist.push(i);
//                 }
//                 else {
//                     version_arr[i] = versions;
//                 }
//                 str_arr[i] = str;
//             }
//             if (i != 0) {
//                 let cur = 0;
//                 let versionmas=tmp.indexOf("release");
//                 let searchstart=tmp.length-1;
//                 if(versionmas>0)searchstart=versionmas-1;
//                 for (j = searchstart; j > 0; j--) {
//                     if (!(parseInt(tmp[j]) >= 0 || tmp[j] == '.'|| tmp[j] == ' '|| tmp[j] == '-'|| tmp[j] == '?'|| tmp[j] == 'V'|| tmp[j] == 'v'|| tmp[j] == 'b')) { cur = j; break; }
//                 }
//                 arr[i].site = tmp.substring(0, cur+1);
//             }

//         }
//         arr[i].site = arr[i].site.trimRight();
//     }
//     tmp = arr[0];

//     let temp = tmp.site;
//     let cur = 0;
//     for (j = temp.length - 1; j > 0; j--) {
//         if (!(parseInt(temp[j]) >= 0 || temp[j] == '.')) { cur = j; break; }
//     }
//     arr[0].site = temp.substring(0, cur);
//     for (j = 0; j < elilist.length; j++) {
//         arr.splice((elilist[elilist.length - j]) - 1, 1);
//     }
//     arr.unshift(tmp);
//     console.log(arr)
//     return arr;
// }
const dupelementary_new = (arr) => {
    let str_arr = [];
    let version_arr = [];
    let versions;
    let elilist = [];
    let i =0;
    for (i = 0; i < arr.length; i++) {
        let tmp = arr[i].a;
        if (tmp != undefined) {
            tmp = tmp.trim();
            let cur = 0;
            let versionmas = tmp.indexOf("release");
            let searchstart = tmp.length;
            if (versionmas > 0) searchstart = versionmas - 1;
            for (j = searchstart - 1; j >= 0; j--) {
                if (!(parseInt(tmp[j]) >= 0 || tmp[j] == '.' || tmp[j] == ',' || tmp[j] == ' ' || tmp[j] == '-' || tmp[j] == '?' || tmp[j] == 'V' || tmp[j] == 'v' || tmp[j] == 'u')) { cur = j; break; }
            }
            let title = tmp.substring(0, cur + 1);
            let str = title.trim();
            let version = tmp.substring(cur + 2, tmp.length);
            versions = version.replace(/[a-z,_,-,?]/g, '');
            // console.log(tmp);
            // console.log(title);
            if (tmp != title) {
                if (versions.indexOf(".") == 0) versions = versions.substring(1, versions.length - 1);
                if (versions != '') {
                    let idx = str_arr.indexOf(str);
                    if (idx != -1) {
                        if (versioncompare(versions, version_arr[idx])) {
                            version_arr[idx] = '';
                            str_arr[idx] = '';
                            elilist.push(idx);
                            version_arr[i] = versions;
                            str_arr[i] = str;
                        } else {
                            // version_arr[i] = 0;
                            elilist.push(i);
                        }
                    }
                    else {
                        version_arr[i] = versions;
                        str_arr[i] = str;
                    }
                }

                    let cur = 0;
                    let versionmas = tmp.indexOf("release");
                    let searchstart = tmp.length - 1;
                    if (versionmas > 0) searchstart = versionmas - 1;
                    for (j = searchstart; j >= 0; j--) {
                        if (!(parseInt(tmp[j]) >= 0 || tmp[j] == '.' || tmp[j] == ' ' || tmp[j] == '-' || tmp[j] == '?' || tmp[j] == 'V' || tmp[j] == 'v' || tmp[j] == 'u')) { cur = j; break; }
                    }
                    arr[i].a = tmp.substring(0, cur + 1);
                    // console.log(arr[i].a);
                    
            }
        }
    }
    console.log(elilist);

    for (i = 0; i < elilist.length; i++) {
        let id = elilist[i];
        arr[id] = {};
    }
    // arr.unshift(tmp);
    const arr_new = [];
    for(i = 0; i<arr.length ; i++){
        if(arr[i].a != undefined){
            arr_new.push(arr[i]);
        }
    }
    console.log(arr_new);
    return arr_new;
}
const integratedlist = (newout_list, cate_list) => {
    let fname = '', type = '', cateid='', paname = '', catename = '';
    const catelist = [], resultdata=[];
    // const row = {a:'', b:'', c:'', d:'', e:'', f:''};
    for(i = 0; i<newout_list.length; i++){
        let tmp = newout_list[i].result;
        // let tmp = "Utilities & Threats - Internet Utilities";
        if(tmp != undefined){
            tmp = tmp.trim();
            let cur = 0;
            let versionmas = tmp.indexOf("release");
            let searchstart = tmp.length;
            if(versionmas>0)searchstart=versionmas-1;
            for (j = searchstart-1; j >= 0; j--) {
                if (!(parseInt(tmp[j]) >= 0 || tmp[j] == '.'|| tmp[j] == ','|| tmp[j] == ' '|| tmp[j] == '-'|| tmp[j] == '?'|| tmp[j] == 'V'|| tmp[j] == 'v'|| tmp[j] == 'u')) { cur = j; break; }
            }
            let title = tmp.substring(0, cur+1);
            str = title.trim();
            let version = tmp.substring(cur+2, tmp.length);
            versions = version.replace(/[a-z,_,-,?]/g, '');
            // console.log(title);
            // console.log(version);
            let cate_stautus = 0;
            for(j=0; j<cate_list.length; j++){
                if(cate_list[j].full_name == tmp){
                    cate_stautus = 1;
                    break;
                }
            }
            if(cate_stautus || tmp == 'None'){
                // console.log('category');
                if(catelist.indexOf(tmp) == -1){
                    catelist.push(tmp);
                    fname = tmp;
                    // console.log(fname);
                }
            }else {
            
                if(tmp != title){
                    // console.log('app');
                    type = '0';
                }else{
                    // console.log('site');
                    type = '1';
                }
                if(fname == 'None'){
                    catelist.push(tmp);
                    title = tmp;
                    cateid = '2';
                    paname = 'Uncategorized';
                    catename = 'Uncategorized';
                    fname = 'Uncategorized - Uncategorized';
                }else{
                    let pos = fname.indexOf('-');                                                                                                                                                                                                                                                                                                                                                       
                    paname = fname.substring(0, pos-1);
                    paname = paname.trim();
                    catename = fname.substring(pos+1, fname.length);
                    catename = catename.trim();
                    // if(i==60)console.log(paname);
                    // let id = cate_list.indexOf(fname);
                    // if(id == -1){
                    //     console.log(fname);
                    //     console.log('no category');
                    // }else{
                    //     cateid = cate_list.id(id);
                    //     console.log(cateid);
                    // }
                    // let cateid = cate_list.id(id);
                    // let cateid = '1';
                    // console.log(cateid);
                    cateid = '';
                    for(j=0; j<cate_list.length; j++){
                        if(cate_list[j].full_name == fname){
                            cateid = cate_list[j].id;
                            break;
                        }
                    }
                }
                // console.log(title);
                
                const row={
                    a:tmp,
                    b:type,
                    c:cateid,
                    d:paname,
                    e:catename,
                    f:fname
                }
                // if(i == 50) console.log(row);
                resultdata.push(row);
                // console.log(resultdata.length);
            }
        }
    }
    // console.log(resultdata);
    // resultdata = dupelementary_new(resultdata);
    return resultdata;
}
let categoryList = [];
const getCid = (str) => {
    for (item in categoryList) {
        if (item.id == x) return item.id;
    }
}
async function testGetData() {
    try {
        const category_list = await getsiteappList("Categories.csv");
        const newout_list = await getsiteappList("out.csv");
        // integratedlist(newout_list, category_list);
        // console.log(resultdata);
        const result_list = integratedlist(newout_list, category_list);
        let write_list = dupelementary_new(result_list);
        // console.log(write_list);
        // const writer_result = mycsvWriter();
        // writer_result.pipe(fs.createWriteStream('result.csv'));
        // result_list.forEach(row => writer_result.write(row));
        // writer_result.end();
        writeresult
            .writeRecords(write_list)
            .then(() => console.log('The CSV file was written successfully'));
        // const read_siteapp = await getsiteappList("out.csv");
        // let write_siteapp = dupelementary_new(read_siteapp);
        // const writer_out = mycsvWriter();
        // writer_out.pipe(fs.createWriteStream('newout.csv'));
        // write_siteapp.forEach(row => writer_out.write(row));
        // writer_out.end();
        // const sitappList = await getsiteappList("uncat.csv");
        // let siteappList = dupelementary(sitappList);
        // const writer = mycsvWriter();
        // writer.pipe(fs.createWriteStream('updateuncat.csv'));
        // siteappList.forEach(row => writer.write(row));
        // writer.end();
        // categoryList = await getcategoryList("Categories.csv");
        // sub_query = "'" + categoryList[0].full_name + "'";
        // for (i = 1; i < categoryList.length; i++) {
        //     sub_query += ", '" + categoryList[i].full_name + "'";
        // }
        // query = "";
        // strToBot = [];
        // for (i = 0; i < sitappList.length; i++) {
        //     query = "Which of these  " + sub_query + "  is the best fit for '" + sitappList[i].site + "' ?";
        //     let item = {
        //         q: query,
        //         value: sitappList[i].site,
        //         actionType: sitappList[i].type
        //     }
        //     strToBot.push(item);
        //     if ((i % max_parrel == 0) && (i > 0)) {
        //         curstatus = String(i) + '/' + String(sitappList.length);
        //         askToDavinci(strToBot, curstatus);
        //         strToBot = [];
        //         await new Promise(resolve => setTimeout(resolve, freq));
        //     }
        // }
        // console.log("-----------------------------------");
        // const obj = mergeArray(result);
        // let list = [];
        // for (x in obj) {
        //     let item = {
        //         f_name: x,
        //         p_name: '',
        //         c_name: '',
        //         id: '',
        //         actionType: '',
        //         cid: ''
        //     }
        //     q = obj[x];
        //     for (y in q) {
        //         item.id = fq[y].val;
        //         item.actionType = q[y].type;
        //         let divId = x.findIndex('-');
        //         item.cid = getCid(x);
        //         item.p_name = x.substring(0, divId);
        //         item.c_name = x.substring(divId + 1, x.length());
        //         list.push(item);
        //     }
        // }

        // csvWriter
        //     .writeRecords(list)
        //     .then(() => console.log('The CSV file was written successfully'));

    } catch (error) {
        console.error("out.csv written error occurred: ", error.message);
    }
}
testGetData();



