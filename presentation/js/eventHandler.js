let selectedRegion = '';
let popularFirst = 1;

function filterRegions() {
    filteredParks = selectedRegion
        ? allData.filter((d) => nameConverter.getRegion(d.location) == selectedRegion)
        : allData;
}

function setTopTen() {
    filterRegions();
    activityFilter.setParks();
    setTimeout(function() {
        barVis.wrangleData();
        updateRadar();
        resultsApp.setRows(topTenParks)
    }, 500);
}

$(eventEmitter).bind('activitiesChanged', setTopTen);

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $('#season-select').val();
    setTopTen();
});

$(eventEmitter).bind('seasonSortChanged', function () {
    popularFirst = Number($('#season-sort').val());
    setTopTen();
});

$(eventEmitter).bind('regionChanged', function () {
    selectedRegion = $('#region-select').val();
    myMapVis.wrangleData();
    setTopTen();
});
