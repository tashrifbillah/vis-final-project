const relations = _.flatten(finalResults.map(r => r.activities.map(a => ({ activity: a.id, park: r.id }))))
const grouped = _.groupBy(relations, 'activity')
const activityCounts = _.fromPairs(Object.entries(grouped).map(([k, v]) => [k, v.length]), c => c[1], 'desc')
const allActivities = _.orderBy(_.uniqBy(_.flatten(finalResults.map(r => r.activities)), 'id').map( a => ({ ...a, count: activityCounts[a.id] })), 'count', 'desc')
let selectedActivities = []
const eventEmitter = {}

new Vue({
    data() {
        return {
            activityCounts,
            allActivities,
            selectedActivities
        }
    },
    computed: {
        activitiesById() {
          return _.fromPairs(this.allActivities.map(a => [a.id, a]))
        },
        selectedActivityIds: {
            get() {
                return this.selectedActivities.map(a => a.id)
            },
            set(arr) {
                selectedActivities = this.selectedActivities = arr.map(id => this.activitiesById[id])
                $(eventEmitter).trigger('activitiesChanged')
            }
        }
    }
}).$mount("#activity-select")