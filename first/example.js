function getData(file, type) {
    let data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv({headers: false, separator: ';',}))
            .on('data', (row) => {
                let item = {
                    date: row[0],
                    value: row[1]
                };
                let item2 = {
                    date: moment(row[0], "DD-MM-YYYY HH:mm").add(30, "minutes").format("DD/MM/YYYY HH:mm"),
                    value: row[2]
                };
                data.push(item);
                data.push(item2);
            })
            .on('end', () => {
                resolve(data);
            });
    });
}

async function testGetData() {
    try { 
        const data = await getData("test.csv", {});
        console.log("testGetData: parsed CSV data:", data);
    } catch (error) {
        console.error("testGetData: An error occurred: ", error.message);
    }
}

testGetData();