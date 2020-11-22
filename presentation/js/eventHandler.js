$(eventEmitter).bind('activitiesChanged', function () {
    /** Example Usage: **/
    barVis.wrangleData()
})

$(eventEmitter).bind('seasonChanged', function () {
    selectedSeason = $("#season-select").val()
    barVis.wrangleData()
})