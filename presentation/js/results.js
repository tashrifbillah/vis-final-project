let resultsApp;
function initResults() {
    new Vue({
        data() {
            return {
                rows: topTenParks,
                selectedId: null,
                apiResults: null,
                dataTypes: [
                    {name: 'Photos', value: null},
                    // {name: 'Parksplaces', value: 'amenities/parksplaces'},
                    // {name: 'Visitor centers', value: 'amenities/parksvisitorcenters'},
                    // {name: 'Articles', value: 'articles'},
                    // {name: 'Passport Stamps', value: 'passportstamplocations'},
                    // {name: 'People', value: 'people'},
                    {name: 'Alerts', value: 'alerts'},
                    {name: 'Campgrounds', value: 'campgrounds'},
                    // {name: 'Events', value: 'events'},
                    {name: 'Places of Interest', value: 'places'},
                    // {name: 'Tours', value: 'tours'},
                    // {name: 'Visitor Centers', value: 'visitorcenters'},
                    // {name: 'Webcams', value: 'webcams'},
                ],
                dataType: null
            }
        },
        computed: {
            currentData() {
                return this.selectedRow
            },
            displayedData() {
                return this.selectedId && (this.dataType ? this.apiResults : this.currentData)
            },
            selectedRow() {
                return this.rows.find(r => r.parkCode === this.selectedId)
            }
        },
        methods: {
            setRows(value) {
                this.rows = value
                this.selectedId = value[0].parkCode
            },
            setSelected({ parkCode }) {
                this.selectedId = parkCode;
                this.apiResults = null;
                this.dataType = null;
            },
            async fetchApi() {
                this.apiResults = null
                const { data } = await axios.get(`https://developer.nps.gov/api/v1/${this.dataType}?parkCode=${this.selectedId}&api_key=nzigokIG0cHxCIgLSutFP9OjLEMnWj27BLaSxfa2`)
                this.apiResults = data
            }
        },
        watch: {
            dataType(val) {
                if(val) this.fetchApi()
                else this.apiResults = null
            }
        }
    }).$mount("#results")
}