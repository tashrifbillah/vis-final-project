Vue.createApp({
  data() {
    return {
      rows: finalResults,
      selectedId: null,
      apiResults: null,
      dataTypes: [
        {name: 'Starting data', value: null},
        {name: 'Parksplaces', value: 'amenities/parksplaces'},
        {name: 'Alerts', value: 'alerts'},
        {name: 'Visitor centers', value: 'amenities/parksvisitorcenters'},
        {name: 'Articles', value: 'articles'},
        {name: 'Campgrounds', value: 'campgrounds'},
        {name: 'Events', value: 'events'},
        {name: 'Passport Stamps', value: 'passportstamplocations'},
        {name: 'People', value: 'people'},
        {name: 'Places', value: 'places'},
        {name: 'Tours', value: 'tours'},
        {name: 'Visitor Centers', value: 'visitorcenters'},
        {name: 'Webcams', value: 'webcams'},
      ],
      dataType: null
    }
  },
  computed: {
    currentData() {
      return this.selectedId && JSON.stringify(this.selectedRow, null, 2)
    },
    displayedData() {
      return this.selectedId && (this.dataType ? this.apiResults : this.currentData)
    },
    selectedRow() {
      return this.rows.find(r => r.parkCode === this.selectedId)
    }
  },
  methods: {
    setSelected({ parkCode }) {
      this.selectedId = parkCode
      this.apiResults = null
    },
    async fetchApi() {
      const { data } = await axios.get(`https://developer.nps.gov/api/v1/${this.dataType}?parkCode=${this.selectedId}&api_key=nzigokIG0cHxCIgLSutFP9OjLEMnWj27BLaSxfa2`)
      this.apiResults = JSON.stringify(data, null, 2)
    }
  },
  watch: {
    dataType(val) {
      if(val) this.fetchApi()
      else this.apiResults = null
    }
  }
}).mount("#app")