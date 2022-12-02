const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
async function runCompletion(str) {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: str,
    });
    console.log(completion.data.choices[0].text.substring(2, 3));
}


const function_search = (sitename, sitepurpose) => {
    return new Promise((resolve, reject) => {
        (async () => {
            const str_purpose = "Is this '" + sitename + "' website for " + sitepurpose + "?";
            const result = await runCompletion(str_purpose);
            if (result == 'Y') {
                resolve(result);
            } else {
                resolve(result);
            }
        })()
    });
}

const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'usage', title: 'Usage' },
        { id: 'site', title: 'Site' }
    ]
});

const sortedarray = [];

const function_sortedarray_add = (site_usage, site_domain) => {
    let status_add = 0;
    for (let i = 0; i < sortedarray.length; i++) {
        if (sortedarray[i].usage == site_usage) {
            for (let j = 0; j < sortedarray[i].site.length; j++) {
                if (sortedarray[i].site[j] == site_domain) {
                    status_add = 1;
                    break;
                }
            }
            if (status_add) {
                break;
            }
            else {
                sortedarray[i].site.push(site_domain);
                status_add = 1;
                break;
            }
        }
    }

    if (!status_add) {
        sortedarray.push({ usage: [site_usage], site: [site_domain] });
    }
}

const getUsage = (sitedomain, categories_data) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                let i = 0, j = 0, purpose = 0, level = 0;
                while (i < categories_data.length) {
                    if (purpose != categories_data[i].purpose) {
                        purpose = categories_data[i].purpose;
                        const result_search_purpose = await function_search(sitedomain, categories_data[i].purpose);
                        if (result_search_purpose == 'Y') {
                            while (j < categories_data.length) {
                                if (categories_data[j].purpose == purpose) {
                                    console.log(sitedomain, categories_data[j].purpose)
                                    result_search_level = await function_search(sitedomain, categories_data[j].level);
                                    if (result_search_level == 'Y') {
                                        function_sortedarray_add(categories_data[j].purpose_level, sitedomain);
                                    }
                                }
                                j++;
                            }
                        }
                    }
                    i++;
                    j = 0;
                }
                resolve(sortedarray);
                return sortedarray;
            } catch (error) {
                console.error("getUsage: An error occurred: ", error.message);
            }
        })()
    });
}

const get_sortedArray = (cat_inputfile, site_array) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const categories = [];
                fs.createReadStream(cat_inputfile)
                    .on('error', error => {
                        reject(error);
                    })
                    .pipe(csv())
                    .on('data', (row) => {
                        categories.push(row);
                        // return row;
                    })
                    .on('end', () => {
                        for (let i = 0; i < site_array.length; i++) {
                            const result_array = getUsage(site_array[i].site, categories);
                            // result_array.then(function (result) {
                            //     resolve(result);
                            // })
                        }
                    });
            } catch (error) {
                console.error("get_sortedArray: An error occurred: ", error.message);
            }
        })()
    });
}

async function MyPro(gpt_inputfile, categories_file) {
    try {
        const site_array_data = [];
        fs.createReadStream(gpt_inputfile)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                site_array_data.push(row);
            })
            .on('end', () => {
                const result_data = get_sortedArray(categories_file, site_array_data);
                // result_data.then(function (result) {
                //     console.log(result); 
                //     csvWriter
                //         .writeRecords(result)
                //         .then(() => console.log('The CSV file was written successfully'));
                // })
            });
    } catch (error) {
        console.error("chatGPT: An error occurred: ", error.message);
    }
}

MyPro("uncat.csv", "Categories.csv");

