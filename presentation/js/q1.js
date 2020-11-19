/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myMapVis,
    parkData

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

    activities= [...new Set(dataArray[1].map(d=>d.activities.map(r=>r.name)).flat())]
    activities.sort((a,b)=>a>b?1:-1)
    selectedActivities= activities
    activities.forEach(d=>$("#activitySelect").append(new Option(d,d,selected=true)))

    // init map
    myMapVis = new MapVis('map', dataArray[0], dataArray[1]);

    // populate parkSelect menu
    parkData= dataArray[1]
    parkData.forEach(d=>$("#parkSelect").append(new Option(d.name,d.name)))

    // populate activitySelect menu
    $(document).ready(function() {
        $("#activitySelect").multiselect({
            searchBoxText:'Type here to filter parks by activities ...',
        })
        $('#activitySelect').click(function(){
            //  $( ":input" ) reads value as space replaced by _, revert that change
            selectedActivities = $( ":input" ).serializeArray().map(d=>d.value.replace(/_/g, " "))
            myMapVis.wrangleData()
        })
    })

}


function displayDetails() {
    selectedPark= $("#parkSelect").val()
    ind= parkData.findIndex(d=>d.name===selectedPark)
    tabularSummary(parkData[ind])
    // make corresponding circle blinking red
}



// function categoryChange() {
//     selectedActivities= $("#activitySelect").val()
//     myMapVis.wrangleData()
// }

