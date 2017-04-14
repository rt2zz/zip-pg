const csv = require('csv-parser')
const fs = require('fs')
const _ = require('lodash')

let count = 0

let payload = { supportedRegions: []}
fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log('check', row.ZIP.slice(0, 4) !== '9001')
    if (row.ZIP.slice(0, 4) !== '9001') return
    try {
      let coordsMatch = /<coordinates>(.*)<\/coordinates>/.exec(row.geometry)
      let coordsArray = coordsMatch[1].split(',')
      let longs = coordsArray.filter((val, i) => i%3 === 0)
      let lats = coordsArray.filter((val, i) => i%3 === 1)
      // formatted specifically for google maps
      let polygon = _.zip(lats, longs).map(ll => ({ lat: ll[0], lng: ll[1]}))
      payload.supportedRegions.push({ zip: row.ZIP, polygon })
    } catch (err) {
      throw err
    }
    count++
    if (payload.supportedRegions.length > 5) {
      console.log(JSON.stringify(payload, null, 2))
      process.exit()
    }
  })
