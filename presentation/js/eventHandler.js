selectedRegion = ''

$(eventEmitter).bind('activitiesChanged', function () {
    updateRadar();
    barVis.wrangleData()
    resultsApp && resultsApp.setRows(topTenParks)
})

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $("#season-select").val()
    barVis.wrangleData()
})

$(eventEmitter).bind('regionChanged', function () {
    selectedRegion = $("#region-select").val()
    myMapVis.wrangleData()
})