let resultsApp;
function initResults() {
    resultsApp = new Vue({
        data() {
            return {
                rows: topTenParks.slice(0, 5),
                selectedId: null,
                apiResults: null,
                dataTypes: [
                    {name: 'Photos', value: null},
                    {name: 'Alerts', value: 'alerts'},
                    {name: 'Campgrounds', value: 'campgrounds'},
                    {name: 'Places of Interest', value: 'places'}
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
                this.rows = [...value].reverse().slice(0, 5)
                if(this.rows.length) this.selectedId = this.rows[0].parkCode
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