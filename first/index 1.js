const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvReader=(inputfile)=>{
    fs.createReadStream(inputfile)
    .pipe(csv())
    .on('data', (row) => {
        console.log(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });
}

const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'name', title: 'Name' },
        { id: 'surname', title: 'Surname' },
        { id: 'age', title: 'Age' },
        { id: 'gender', title: 'Gender' },
    ]
});

const data = [
    {
        name: 'John',
        surname: 'Snow',
        age: 26,
        gender: 'M'
    }, {
        name: 'Clair',
        surname: 'White',
        age: 33,
        gender: 'F',
    }, {
        name: 'Fancy',
        surname: 'Brown',
        age: 78,
        gender: 'F'
    }
];

// csvReader(uncat);

csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully'));
csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully'));

const filePath = 'out.csv';
// const data = 'This is new data to be added';
    
// Append data to the file
fs.appendFile(filePath, data, err => {
    if (err) {
    console.error(err);
    return;
    }
    
    console.log('Data added successfully!');
    });


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


// runCompletion("Is this 'goibibo.com' website for Business?");