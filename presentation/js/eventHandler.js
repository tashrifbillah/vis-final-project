$(eventEmitter).bind('activitiesChanged', function () {
    updateRadar();
    barVis.wrangleData()
})

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $("#season-select").val()
    barVis.wrangleData()
})