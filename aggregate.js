/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const fileRead = filepath => new Promise((resolve, reject) => {
  fs.readFile(filepath, 'utf8', (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

const writeFile = (filepath, data) => new Promise((resolve, reject) => {
  fs.writeFile(filepath, data, (err) => {
    if (err) reject(err);
    else resolve(data);
  });
});

const aggregate = filePath => new Promise((resolve, reject) => {
  Promise.all([fileRead(filePath), fileRead('countriesmap.txt')]).then((values) => {
    // converting country continent to map

    const countryContinentMap = values[1].split('\n').reduce((accumulator, row) => {
      const [country, continent] = row.split(',');
      accumulator[country] = continent;
      return accumulator;
    }, {});

    const data = values[0].replace(/['"]+/g, '');
    const splitData = data.split('\n');
    const headers = splitData[0].split(',');
    const indexOfPopulation = headers.indexOf('Population (Millions) - 2012');
    const indexOfCountry = headers.indexOf('Country Name');
    const indexOfGDP = headers.indexOf('GDP Billions (US Dollar) - 2012');
    const aggregatedValues = {};

    splitData.forEach((rowTxt) => {
      const row = rowTxt.split(',');
      if (countryContinentMap[row[indexOfCountry]] !== undefined && row[indexOfCountry] !== 'European Union') {
        if (aggregatedValues[countryContinentMap[row[indexOfCountry]]] === undefined) {
          aggregatedValues[countryContinentMap[row[indexOfCountry]]] = {};
          aggregatedValues[countryContinentMap[row[indexOfCountry]]]
            .GDP_2012 = parseFloat(row[indexOfGDP]);
          aggregatedValues[countryContinentMap[row[indexOfCountry]]]
            .POPULATION_2012 = parseFloat(row[indexOfPopulation]);
        } else {
          aggregatedValues[countryContinentMap[row[indexOfCountry]]]
            .GDP_2012 += parseFloat(row[indexOfGDP]);
          aggregatedValues[countryContinentMap[row[indexOfCountry]]]
            .POPULATION_2012 += parseFloat(row[indexOfPopulation]);
        }
      }
    });
    writeFile('./output/output.json', JSON.stringify(aggregatedValues)).then(() => resolve(), err => reject(err));
  }).catch(errors => console.log(errors));
});

module.exports = aggregate;
