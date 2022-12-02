const csv = require('./');

describe('csv-generate', () => {
  it('must generate a specific CSV file', async () => {
    const rows = await csv.parse(await csv.generate({ columns: 3, length: 5 }));
    expect(rows.length).toBe(5);
    rows.every(row => expect(row.length).toBe(3));
  });
});

describe('csv-stringify', () => {
  it('must generate correct CSV string', async () => {
    const sampleData = [
      ['HK', 'Hong Kong Island'],
      ['KLN', 'Kowloon'],
      ['NT', 'New Territories'],
    ];

    const result = await csv.stringify(sampleData);

    expect(result).toBe('HK,Hong Kong Island\nKLN,Kowloon\nNT,New Territories\n');
  });
});

describe('csv-parse', () => {
  it('must be able to parse a CSV file successfully', async () => {
    const sample = `Column 1,Column 2,Column 3
      1,2,3
      4,5,6
      7,8,some other data`;
    const rows = await csv.parse(sample);
    expect(rows.length).toBe(4);
    rows.every(row => expect(row.length).toBe(3));
  });

  it('must be able to take optional params too', async () => {
    const sample = `Column 1,Column 3
      1,2,3
      4,5,6
      7,8,some other data`;
    const rows = await csv.parse(sample, { relaxColumnCount: true });
    expect(rows.length).toBe(4);
  });
});
