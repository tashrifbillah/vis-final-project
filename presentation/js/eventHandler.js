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
})

$(eventEmitter).bind('seasonSortChanged', function () {
    popularFirst = Number($("#season-sort").val())
    barVis.wrangleData()
})

$(eventEmitter).bind('regionChanged', function () {
    selectedRegion = $("#region-select").val()
    myMapVis.wrangleData()
})