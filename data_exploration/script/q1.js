/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myMapVis

// load data using promises
let promises = [
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
  d3.json("../data-cleaning/cleaned_data.json")
];

Promise.all(promises)
  .then( function(data){ initMainPage(data) })
  .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

  // log data
  console.log('Check out the data', dataArray);

  // init map
  myMapVis = new MapVis('map', dataArray[0], dataArray[1]);

}

