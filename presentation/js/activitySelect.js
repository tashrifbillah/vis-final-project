const relations = _.flatten(finalResults.map(r => r.activities.map(a => ({ activity: a.id, park: r.id }))))
const grouped = _.groupBy(relations, 'activity')
const activityCounts = _.fromPairs(Object.entries(grouped).map(([k, v]) => [k, v.length]), c => c[1], 'desc')
const allActivities = _.orderBy(_.uniqBy(_.flatten(finalResults.map(r => r.activities)), 'id').map( a => ({ ...a, count: activityCounts[a.id] })), 'count', 'desc')
const eventEmitter = {}

let selectedActivities = []
let topTenParks = []

new Vue({
    data() {
        return {
            filter: "",
            activityCounts,
            allActivities,
            selectedActivities,
            parks: finalResults
        }
    },
    computed: {
        activitiesById() {
          return _.fromPairs(this.allActivities.map(a => [a.id, a]))
        },
        parksById() {
            return _.fromPairs(this.parks.map(p => [p.id, p]))
        },
        visibleActivities() {
            const lower = this.filter.toLowerCase()
            const filtered = lower.length ? this.allActivities.filter(a => a.name.toLowerCase().includes(lower)) : this.allActivities
            return _.uniqBy(this.selectedActivities.concat(filtered), 'id')
        },
        selectedActivityIds: {
            get() {
                return this.selectedActivities.map(a => a.id)
            },
            set(arr) {
                this.selectedActivities = selectedActivities = arr.map(id => this.activitiesById[id])

                // Set topTenParks
                const allParks = _.flatten(arr.map(id => grouped[id]))
                const counts = _.orderBy(Object.entries(_.countBy(allParks, 'park')), d => d[1], 'desc')
                topTenParks = counts.slice(0, 10).map(([park,]) => this.parksById[park])

                $(eventEmitter).trigger('activitiesChanged')
            }
        }
    }
}).$mount("#activity-select")