let selectedRegion = ''
let popularFirst = 1

$(eventEmitter).bind('activitiesChanged', function () {
    updateRadar();
    barVis.wrangleData()
    resultsApp && resultsApp.setRows(topTenParks)
})

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $("#season-select").val()
    barVis.wrangleData()
    resultsApp.setRows(topTenParks)
})

$(eventEmitter).bind('seasonSortChanged', function () {
    popularFirst = Number($("#season-sort").val())
    barVis.wrangleData()

    // IMPORTANT: this must come after bar vis wrangling to apply sort
    resultsApp.setRows(topTenParks)
})

$(eventEmitter).bind('regionChanged', function () {
    selectedRegion = $("#region-select").val()
    myMapVis.wrangleData()
})