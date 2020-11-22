
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

