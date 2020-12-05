const eventEmitter = {};
let selectedActivities = [];
let topTenParks = [];
let activityFilter;

function initActivitySelect() {
    topTenParks = filteredParks.slice(0, 10);

    activityFilter = new Vue({
        data() {
            return {
                filter: '',
                selectedActivities,
                parks: filteredParks,
            };
        },
        methods: {
            setParks() {
                this.parks = filteredParks;
                this.selectedActivities = this.selectedActivities.filter(({ id }) => this.activitiesById[id]);
            },
        },
        computed: {
            relations() {
                return _.flatten(this.parks.map((r) => r.activities.map((a) => ({ activity: a.id, park: r.id }))));
            },
            grouped() {
                return _.groupBy(this.relations, 'activity');
            },
            activityCounts() {
                return _.fromPairs(
                    Object.entries(this.grouped).map(([k, v]) => [k, v.length]),
                    (c) => c[1],
                    'desc',
                );
            },
            allActivities() {
                return _.orderBy(
                    _.uniqBy(_.flatten(this.parks.map((r) => r.activities)), 'id').map((a) => ({
                        ...a,
                        count: this.activityCounts[a.id],
                    })),
                    'count',
                    'desc',
                );
            },
            activitiesById() {
                return _.fromPairs(this.allActivities.map((a) => [a.id, a]));
            },
            parksById() {
                return _.fromPairs(this.parks.map((p) => [p.id, p]));
            },
            visibleActivities() {
                const lower = this.filter.toLowerCase();
                const filtered = lower.length
                    ? this.allActivities.filter((a) => a.name.toLowerCase().includes(lower))
                    : this.allActivities;
                return _.uniqBy(this.selectedActivities.concat(filtered), 'id');
            },
            selectedActivityIds: {
                get() {
                    return this.selectedActivities.map((a) => a.id);
                },
                set(arr) {
                    this.selectedActivities = selectedActivities = _.compact(arr.map((id) => this.activitiesById[id]));

                    // Set topTenParks
                    const parks = _.flatten(arr.map((id) => this.grouped[id]));
                    const counts = _.orderBy(Object.entries(_.countBy(parks, 'park')), (d) => d[1], 'desc');
                    topTenParks = counts.slice(0, 10).map(([park]) => this.parksById[park]);

                    $(eventEmitter).trigger('activitiesChanged');
                },
            },
        },
    }).$mount('#activity-select');
}
