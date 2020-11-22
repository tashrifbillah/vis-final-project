$(eventEmitter).bind('activitiesChanged', function () {
    /** Example Usage: **/
    // q1.wrangleData(selectedActivities, topTenParks)
    updateRadar();
    barVis.wrangleData(selectedActivities, topTenParks)
})