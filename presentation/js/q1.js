/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myMapVis;

// load data using promises
let promises = [
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.json("data/cleaned_data.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('Check out the data', dataArray);

    // $(document).ready(function() {
    //     $("#activitySelect").multiselect()
    // })


    activities= [...new Set(dataArray[1].map(d=>d.activities.map(r=>r.name)).flat())]
    activities.sort((a,b)=>a>b?1:-1)
    selectedActivities= activities
    activities.forEach(d=>$("#activitySelect").append(new Option(d,d)))

    // init map
    myMapVis = new MapVis('map', dataArray[0], dataArray[1]);


}

function categoryChange() {
    selectedActivities= $("#activitySelect").val()
    myMapVis.wrangleData()
}

