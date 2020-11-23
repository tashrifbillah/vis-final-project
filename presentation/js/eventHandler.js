$(eventEmitter).bind('activitiesChanged', function () {
    updateRadar();
    barVis.wrangleData()
    resultsApp.setRows(topTenParks)
})

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $("#season-select").val()
    barVis.wrangleData()
})