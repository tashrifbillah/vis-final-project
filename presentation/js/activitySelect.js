const eventEmitter = {};
let selectedActivities = [];
let topTenParks = [];
let activityFilter;

const applySort = (activities) => _.orderBy(activities, ['count', 'name'], ['desc', 'asc']);
function initActivitySelect() {
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
                this.selectedActivities = _.compact(this.selectedActivities.map(({ id }) => this.activitiesById[id]));
            },
        },
        computed: {
            relations() {
                return _.flatten(
                    _.shuffle(this.parks).map((r) => r.activities.map((a) => ({ activity: a.id, park: r.id }))),
                );
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
                const records = _.uniqBy(_.flatten(this.parks.map((r) => r.activities)), 'id').map((a) => ({
                    ...a,
                    count: this.activityCounts[a.id],
                }));
                return applySort(records);
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
                return _.uniqBy(applySort(this.selectedActivities).concat(filtered), 'id');
            },
            topTenParks() {
                if (!this.selectedActivityIds.length) {
                    topTenParks = _.shuffle(this.parks).slice(0, 10);
                    return topTenParks;
                }

                const parks = _.flatten(this.selectedActivityIds.map((id) => this.grouped[id]));
                const counts = _.orderBy(Object.entries(_.countBy(parks, 'park')), (d) => d[1], 'desc');
                return (topTenParks = _.compact(counts.slice(0, 10).map(([park]) => this.parksById[park])));
            },
            selectedActivityIds: {
                get() {
                    return this.selectedActivities.map((a) => a.id);
                },
                set(arr) {
                    this.selectedActivities = selectedActivities = _.compact(arr.map((id) => this.activitiesById[id]));
                    $(eventEmitter).trigger('activitiesChanged');
                },
            },
        },
    }).$mount('#activity-select');
}
