
/* * * * * * * * * * * * * *
*      NameConverter       *
* * * * * * * * * * * * * */

class NameConverter {
    constructor() {
        this.states = [
            ['Alabama', 'AL', 'South'],
            ['Alaska', 'AK', 'West'],
            ['American Samoa', 'AS', 'West'],
            ['Arizona', 'AZ', 'West'],
            ['Arkansas', 'AR', 'South'],
            ['California', 'CA', 'West'],
            ['Colorado', 'CO', 'West'],
            ['Connecticut', 'CT', 'Northeast'],
            ['Delaware', 'DE', 'Northeast'],
            ['District of Columbia', 'DC', 'South'],
            ['Florida', 'FL', 'South'],
            ['Georgia', 'GA', 'South'],
            ['Guam', 'GU', 'West'],
            ['Hawaii', 'HI', 'West'],
            ['Idaho', 'ID', 'West'],
            ['Illinois', 'IL', 'Midwest'],
            ['Indiana', 'IN', 'Midwest'],
            ['Iowa', 'IA', 'Midwest'],
            ['Kansas', 'KS', 'Midwest'],
            ['Kentucky', 'KY', 'South'],
            ['Louisiana', 'LA', 'South'],
            ['Maine', 'ME', 'Northeast'],
            ['Maryland', 'MD', 'Northeast'],
            ['Massachusetts', 'MA', 'Northeast'],
            ['Michigan', 'MI', 'Midwest'],
            ['Minnesota', 'MN', 'Midwest'],
            ['Mississippi', 'MS', 'South'],
            ['Missouri', 'MO', 'Midwest'],
            ['Montana', 'MT', 'West'],
            ['Nebraska', 'NE', 'Midwest'],
            ['Nevada', 'NV', 'West'],
            ['New Hampshire', 'NH', 'Northeast'],
            ['New Jersey', 'NJ', 'Northeast'],
            ['New Mexico', 'NM', 'West'],
            ['New York', 'NY', 'Northeast'],
            ['North Carolina', 'NC', 'South'],
            ['North Dakota', 'ND', 'Midwest'],
            ['Commonwealth of the Northern Mariana Islands', 'NP', 'West'],
            ['Ohio', 'OH', 'Midwest'],
            ['Oklahoma', 'OK', 'South'],
            ['Oregon', 'OR', 'West'],
            ['Pennsylvania', 'PA', 'Northeast'],
            ['Puerto Rico', 'PR', 'South'],
            ['Rhode Island', 'RI', 'Northeast'],
            ['South Carolina', 'SC', 'South'],
            ['South Dakota', 'SD', 'Midwest'],
            ['Tennessee', 'TN', 'South'],
            ['Texas', 'TX', 'South'],
            ['United States Virgin Islands', 'VI', 'South'],
            ['Utah', 'UT', 'West'],
            ['Vermont', 'VT', 'Northeast'],
            ['Virginia', 'VA', 'South'],
            ['Washington', 'WA', 'West'],
            ['West Virginia', 'WV', 'South'],
            ['Wisconsin', 'WI', 'Midwest'],
            ['Wyoming', 'WY', 'West'],
            // VI occurs in two forms across geoData and parkData, so support both :(
            ['U.S. Virgin Islands', 'VI', 'South'],
        ]
    }

    getAbbreviation(input){
        let that = this
        let output = '';
        that.states.forEach( state => {
            if (state[0] === input){
            output = state[1]
        }})
        return output
    }

    getFullName(input){
        let that = this
        let output = '';
        that.states.forEach( state => {
            if (state[1] === input){
                output = state[0]
            }})
        return output
    }

    getRegion(input){
        let that = this
        let output = '';
        that.states.forEach( state => {
            if (state[0] === input){
                output = state[2]
            }})
        return output
    }
}

let nameConverter = new NameConverter()


class MonthSeason {
    constructor() {

        /*
        Given a month, obtain season:
            month="January"
            month2season[month]
        Given a season, obtain months:
            season="spring"
            Object.keys(month2season).filter(key=>month2season[key]==season)
        Obtain all months:
            Object.keys(month2season)
        Obtain all seasons:
            [...new Set(Object.values(month2season))]
         */

        this.month2season = {
            // Spring
            "March": "Spring",
            "April": "Spring",
            "May": "Spring",

            // Summer
            "June": "Summer",
            "July": "Summer",
            "August": "Summer",

            // Fall
            "September": "Fall",
            "October": "Fall",
            "November": "Fall",

            // Winter
            "December": "Winter",
            "January": "Winter",
            "February": "Winter"
        }
    }

    getSeason(month) {
        let obj=this
        return this.month2season[month]
    }

    getMonths(season) {
        let obj=this
        return Object.keys(obj.month2season).filter(key => obj.month2season[key] == season)
    }
}

let monthSeason = new MonthSeason()

// Given an array of available activities, this function uses the global selectedActivities
// to sort the available activities with user matches appearing at the beginning.
function activityMatch(activities) {
    let selectedActivityNames = selectedActivities.map(d => d.name);
    let availableActivityNames = activities.map(d => d.name);
    // Randomize the array before starting to avoid alphabetical bias
    randomize(availableActivityNames);

    availableActivityNames.sort( function(a,b) {
        return selectedActivityNames.indexOf(b) - selectedActivityNames.indexOf(a);
    })
    return availableActivityNames;
}

// Array shuffling based on the Fisher-Yates Algorithm, as described by Nitin Patel
// Source: https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
function randomize(array) {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

function getParksInState(all_data, state) {
    let exclusive = all_data.filter(d => d.states == state).map(d => d.name);
    let shared = all_data.filter(d => d.states.includes(state) && d.states != state).map(d => d.name);
    return {'exclusive': exclusive, 'shared': shared};
}

function getStateFromPark(all_data, parkName) {
    return all_data.filter(d => d.name == parkName).map(d => d.states);
}
