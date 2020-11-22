/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class LineVis {

    constructor(parentElement, parkData) {
        this.parentElement = parentElement;
        this.parkData = parkData;
        this.displayData;

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 80};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);


        // Scales and Axes
        vis.x = d3.scaleBand()
            .range([vis.margin.left, vis.width])
        vis.xAxis= d3.axisBottom()

        vis.y = d3.scaleLinear()
            .range([vis.height, vis.margin.top])
        vis.yAxis= d3.axisLeft()

        vis.gx= vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(" + 0 + "," + `${vis.height+15}` + ")")

        vis.gy= vis.svg.append("g")
            .attr("class", "axis y-axis")
            .attr("transform", "translate(" + vis.margin.left + "," + "10)")


        vis.gy.append('text')
            .attr("y", 5)
            .attr('class', 'title y-title')

        // Group of pattern elements
        vis.patterng= vis.svg.append('g')

        // Path
        vis.path= vis.patterng.append("path")
            .attr("class", "path")

        vis.path1= vis.patterng.append("path")
            .attr("class", "path")

        // Draw path
        vis.trend= d3.line()
            .curve(d3.curveCardinal)
            .y(d=>vis.y(d))

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

        vis.wrangleData()

    }


    wrangleData() {
        let vis = this;

        let monthly= vis.parkData.map(d=>d["monthly visit"])

        if (groupBy=='months') {
            vis.y2019 = months.map(m => monthly.map(d => d[m]?d[m][m + " 2019"]:0).reduce((a, v) => a + v, 0))
            vis.y2020 = months.map(m => monthly.map(d => d[m]?d[m][m + " 2020"]:0).reduce((a, v) => a + v, 0))

            vis.groups= months

            vis.svg.select(".y-title")
                .text("Monthly visit")

        } else if (groupBy=='ytd') {
            vis.y2019 = months.map(m => monthly.map(d => d[m]?d[m]["YTD 2019"]:0).reduce((a, v) => a + v, 0))
            vis.y2020 = months.map(m => monthly.map(d => d[m]?d[m]["YTD 2020"]:0).reduce((a, v) => a + v, 0))

            vis.groups= months
            vis.svg.select(".y-title")
                .text("Year to date visit")

        } else if (groupBy=='seasons') {
            vis.y2019 = months.map(m => monthly.map(d => d[m]?d[m][m + " 2019"]:0).reduce((a, v) => a + v, 0))
            vis.y2020 = months.map(m => monthly.map(d => d[m]?d[m][m + " 2020"]:0).reduce((a, v) => a + v, 0))

            vis.y2019= seasonalAvg(vis.y2019)
            vis.y2020= seasonalAvg(vis.y2020)

            // Override with seasons
            vis.groups= ["Winter", "Spring", "Summer", "Fall"]

            vis.svg.select(".y-title")
                .text("Monthly average visit")
        }

        vis.updateVis()

    }



    updateVis(){
        let vis = this;


        vis.x.domain(vis.groups)
        vis.xAxis.scale(vis.x)
        vis.gx
            .transition()
            .duration(1000)
            .call(vis.xAxis)


        vis.y.domain([0, d3.max([vis.y2019,vis.y2020].flat())])
        vis.yAxis.scale(vis.y)
        vis.gy
            .transition()
            .duration(1000)
            .call(vis.yAxis)


        vis.trend
            .x((d,i)=>vis.x(vis.groups[i]))


        vis.patterng
            .attr("transform", `translate(${vis.x.bandwidth()/2},10)`)


        let tmp= vis.patterng.selectAll(".numVisit")
            .data(vis.y2019, (d,i)=>i)

        let circle= tmp.enter()
            .append("circle")
            .merge(tmp)
            .transition()
            .duration(1000)
            .attr('cx', (d,i)=>vis.x(vis.groups[i]))
            .attr('cy', d=>vis.y(d))
            .attr("class", "point numVisit")
            .attr("fill", "lightskyblue")

        vis.path
            .datum(vis.y2019)
            .transition()
            .duration(1000)
            .attr("d", vis.trend)
            .attr("stroke", "black")
            .attr("fill", "none")


        let tmp1= vis.patterng.selectAll(".numVisit1")
            .data(vis.y2020, (d,i)=>i)

        let circle1= tmp1.enter()
            .append("circle")
            .merge(tmp1)
            .transition()
            .duration(1000)
            .attr('cx', (d,i)=>vis.x(vis.groups[i]))
            .attr('cy', d=>vis.y(d))
            .attr("class", "point numVisit1")
            .attr("fill", "magenta")

        vis.path1
            .datum(vis.y2020)
            .transition()
            .duration(1000)
            .attr("d", vis.trend)
            .attr("stroke", "black")
            .attr("fill", "none")


        tmp.exit().remove()
        tmp1.exit().remove()

    }

}


function seasonalAvg(monthly) {

    let avg=[]

    // Winter
    avg[0]= (monthly[0]+monthly[1])/2

    // Spring
    avg[1]= (monthly[2]+monthly[3]+monthly[4])/3

    // Summer
    avg[2]= (monthly[5]+monthly[6]+monthly[7])/3

    // Fall
    avg[3]= (monthly[8])/2

    avg=avg.map(d=>Math.round(d))

    return avg
}
