$(eventEmitter).bind('activitiesChanged', function () {
    document.getElementById('selected-activities').innerHTML = selectedActivities.map(a => a.name)
})