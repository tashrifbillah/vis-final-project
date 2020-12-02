/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myMapVis,
    myLineVis,
    parkData,
    groupBy,
    months=['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep'],
    seasons=["Winter", "Spring", "Summer", "Fall"]

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

    // init map
    myMapVis = new MapVis('map', dataArray[0], dataArray[1]);

    // populate parkSelect menu
    parkData= dataArray[1]
    parkData.sort((a,b)=>a.name>b.name?1:-1)
    parkData.forEach(d=>$("#parkSelect").append(new Option(d.name,d.name)))

    // init line-graph
    myLineVis = new LineVis('line-graph', dataArray[1]);


}


function displayDetails() {

    selectedPark= $("#parkSelect").val()
    // bypass the place holder string
    if (!selectedPark) {
        return
    }

    // bring back all the circles if some were filtered out by activities earlier
    $('#map').empty()
    myMapVis.initVis()

    ind= parkData.findIndex(d=>d.name===selectedPark)
    tabularSummary(parkData[ind])

    // make the corresponding circle blink
    d3.selectAll('.location').filter(d => d.name === selectedPark)
        .transition().duration(1000).attr('fill', 'red').attr('r', '20')
        .transition().duration(1000).attr('fill', 'lightskyblue').attr('r', '10')
        .transition().duration(1000).attr('fill', 'red').attr('r', '20')
        .transition().duration(1000).attr('fill', 'lightskyblue').attr('r', '10')
        .transition().duration(1000).attr('fill', 'red').attr('r', '20')
        .transition().duration(1000).attr('fill', 'lightskyblue').attr('r', '10')
        .transition().duration(1000).attr('fill', 'red').attr('r', '20')
        .transition().duration(1000).attr('fill', 'lightskyblue').attr('r', '10')
        .transition().duration(1000).attr('fill', 'red').attr('r', '20')
        .transition().duration(1000).attr('fill', 'lightskyblue').attr('r', '10')

}

window.addEventListener("resize", function(){
    // Delete previous svg layout
    $("#map").empty();
    $("#line-graph").empty();

    // Render new svg layout
    myMapVis.initVis();
    myLineVis.initVis();
});


groupBy= $("#group-by").val()
function _groupBy() {
    groupBy= $("#group-by").val()
    myLineVis.wrangleData()
}

