// init global variables & switches
let myMapVis,
    myLineVis,
    parkData,
    groupBy,
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep'],
    seasons = ['Winter', 'Spring', 'Summer', 'Fall'];

// load data using promises
let promises = [d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'), d3.json('data/cleaned_data.json')];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data);
    })
    .catch(function (err) {
        console.log(err);
    });

// initMainPage
function initMainPage(dataArray) {
    // log data
    // console.log('Check out the data', dataArray);

    // init map
    myMapVis = new MapVis('map', dataArray[0], dataArray[1]);

    parkData = dataArray[1];

    // init line-graph
    myLineVis = new LineVis('line-graph', dataArray[1]);

    document.getElementsByClassName('s2m_details')[0].innerHTML += s2m_table;
    document.getElementsByClassName('s2m_details')[1].innerHTML += s2m_table;
}

function displayDetails() {
    selectedPark = $('#parkSelect').val();
    // bypass the place holder string
    if (!selectedPark) {
        return;
    }

    // bring back all the circles if some were filtered out by activities earlier
    $('#map').empty();
    myMapVis.initVis();

    ind = parkData.findIndex((d) => d.name === selectedPark);
    tabularSummary(parkData[ind]);

    // make the corresponding circle blink
    d3.selectAll('.location')
        .filter((d) => d.name === selectedPark)
        .transition()
        .duration(1000)
        .attr('fill', sharedRed)
        .attr('r', '20')
        .transition()
        .duration(1000)
        .attr('fill', sharedGreen)
        .attr('r', '10')
        .transition()
        .duration(1000)
        .attr('fill', sharedRed)
        .attr('r', '20')
        .transition()
        .duration(1000)
        .attr('fill', sharedGreen)
        .attr('r', '10')
        .transition()
        .duration(1000)
        .attr('fill', sharedRed)
        .attr('r', '20')
        .transition()
        .duration(1000)
        .attr('fill', sharedGreen)
        .attr('r', '10');
}


groupBy = $('#group-by').val();
function _groupBy() {
    groupBy = $('#group-by').val();
    myLineVis.wrangleData();
}

let s2m_table = `<table class="table table-striped" style="width: fit-content">
<tbody>
<tr>
  <th>Name</th>
  <th>Months</th>
</tr>`;
seasons.forEach((s) => {
    s2m_table += `<tr>
              <td>${s}</td>
              <td>${monthSeason.getMonths(s).join(', ')}</td>
            </tr>`;
});

s2m_table += `</tbody></table>`;
