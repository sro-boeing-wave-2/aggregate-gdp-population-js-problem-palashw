/**
 * Aggregates GDP and Population Data by Continents
 * @param {*} filePath
 */
const fs = require('fs');

const aggregate = (filePath) => {
  let splitData;
  let dataString;
  let headers;
  let countryObjects;
  const countryMap = [];
  const conti = [];

  // converting country continent to map
  const fileContents = fs.readFileSync('countriesmap.txt', 'utf8');
  const splitString = fileContents.split('\n');
  let splitByComma;
  const countryContinentMap = new Map();
  for (let i = 0; i < splitString.length; i += 1) {
    splitByComma = splitString[i].split(',');
    splitByComma[1] = splitByComma[1].replace(/\r/g, '');
    countryContinentMap.set(splitByComma[0], splitByComma[1]);
  }

  // reading datafile and making final op
  const data = fs.readFileSync(filePath, 'utf8');
  //  => {
    // if (err) {
    //   throw err;
    // }
    dataString = data.toString();
    splitData = dataString.split('\n');
    headers = splitData[0].split(',');
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
    for (let i = 0; i < countryMap.length; i += 1) {
      if (countryMap[i]['Country Name'] !== 'European Union') {
        countryMap[i].continent = countryContinentMap.get(countryMap[i]['Country Name']);
        conti.push(countryContinentMap.get(countryMap[i]['Country Name']));
      }
    }
    const continent = new Set(conti);
    const contisplitData = [...continent];
    contisplitData.splice(6, 1);
    const finalsplitData = [];
    const countryObjectsectdefined = {};
    for (let i = 0; i < contisplitData.length; i += 1) {
      let sumpop = 0;
      let sumgdp = 0;
      for (let j = 0; j < countryMap.length; j += 1) {
        if (contisplitData[i] === countryMap[j].continent) {
          sumpop += parseFloat(countryMap[j]['Population (Millions) - 2012']);
          sumgdp += parseFloat(countryMap[j]['GDP Billions (US Dollar) - 2012']);
        }
      }
      const name = {};
      name.GDP_2012 = sumgdp;
      name.POPULATION_2012 = sumpop;
      finalsplitData.push(name);
    }
    for (let i = 0; i < contisplitData.length; i += 1) {
      countryObjectsectdefined[contisplitData[i]] = finalsplitData[i];
    }
    fs.writeFileSync('./output/output.json', JSON.stringify(countryObjectsectdefined));
  };
module.exports = aggregate;
