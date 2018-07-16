/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const fileRead = filepath1 => new Promise((resolve, reject) => {
  fs.readFile(filepath1, 'utf8', (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

const aggregate = filePath => new Promise((resolve1, reject1) => {
  Promise.all([fileRead(filePath), fileRead('countriesmap.txt')]).then((values) => {
    // converting country continent to map
    const mapContents = values[1];
    const splitMapstring = mapContents.split('\n');
    let splitMapByComma;
    const countryContinentMap = new Map();
    for (let i = 0; i < splitMapstring.length; i += 1) {
      splitMapByComma = splitMapstring[i].split(',');
      splitMapByComma[1] = splitMapByComma[1].replace(/\r/g, '');
      countryContinentMap.set(splitMapByComma[0], splitMapByComma[1]);
    }

    // cleaning datafile.csv
    let countryObjects;
    const countryMap = [];
    const data = values[0];
    const dataString = data.toString();
    const splitData = dataString.split('\n');
    const headers = splitData[0].split(',');
    for (let i = 0; i < headers.length; i += 1) {
      headers[i] = headers[i].replace(/['"]+/g, '');
    }
    for (let i = 1; i < splitData.length; i += 1) {
      const cleandata = splitData[i].split(',');
      for (let k = 0; k < cleandata.length; k += 1) {
        cleandata[k] = cleandata[k].replace(/['"]+/g, '');
      }
      countryObjects = {};
      for (let j = 0; j < cleandata.length; j += 1) {
        countryObjects[headers[j]] = cleandata[j];
      }
      countryMap.push(countryObjects);
    }
    // mapping continent to countrydata
    const continentlist = [];
    for (let i = 0; i < countryMap.length; i += 1) {
      if (countryMap[i]['Country Name'] !== 'European Union') {
        countryMap[i].continent = countryContinentMap.get(countryMap[i]['Country Name']);
        continentlist.push(countryContinentMap.get(countryMap[i]['Country Name']));
      }
    }
    const continentsplitData = [...new Set(continentlist)];
    continentsplitData.splice(6, 1);

    const finalsplitData = [];
    const countryObjectsectdefined = {};
    // aggregating
    for (let i = 0; i < continentsplitData.length; i += 1) {
      let sumpop = 0;
      let sumgdp = 0;
      for (let j = 0; j < countryMap.length; j += 1) {
        if (continentsplitData[i] === countryMap[j].continent) {
          sumpop += parseFloat(countryMap[j]['Population (Millions) - 2012']);
          sumgdp += parseFloat(countryMap[j]['GDP Billions (US Dollar) - 2012']);
        }
      }
      const name = {};
      name.GDP_2012 = sumgdp;
      name.POPULATION_2012 = sumpop;
      finalsplitData.push(name);
    }
    // making final object in required format
    for (let i = 0; i < continentsplitData.length; i += 1) {
      countryObjectsectdefined[continentsplitData[i]] = finalsplitData[i];
    }
    const filewrite = (filepath3, finaldata) => new Promise((resolve, reject) => {
      fs.writeFile(filepath3, finaldata, (err) => {
        if (err) reject(err);
        resolve(finaldata);
      });
    });
    filewrite('./output/output.json', JSON.stringify(countryObjectsectdefined)).then(() => resolve1(), err => reject1(err));
  })
    .catch(errors => console.log(errors));
});

module.exports = aggregate;
