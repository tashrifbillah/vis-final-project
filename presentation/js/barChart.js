let selectedSeason = "All"

class BarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;

        const WIDTH = 800;
        const HEIGHT = 500;

        vis.margin = {top: 40, right: 60, bottom: 60, left: 250};

        vis.width = WIDTH - vis.margin.left - vis.margin.right;
        vis.height = HEIGHT - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Overlay with path clipping
        // vis.svg.append("defs").append("clipPath")
        //   .attr("id", "clip")
        //   .append("rect")
        //   .attr("width", vis.width)
        //   .attr("height", vis.height);

        // vis.title = vis.svg.append("text").attr("x", 0).attr("y", -20).text(vis.config.title)

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleBand(d3.schemeCategory10)
            .padding(0.1)
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        vis.displayData = topTenParks.length ? [...topTenParks] : vis.data;
        vis.displayData.forEach(d=>{
            if (isNaN(d.seasonalVisits[selectedSeason])) {
                d.seasonalVisits[selectedSeason] = 0
            }
        })
        vis.displayData.sort((a, b) => a.seasonalVisits[selectedSeason] - b.seasonalVisits[selectedSeason])
        vis.displayData = vis.displayData.slice(0, 10)

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        vis.y.domain(vis.displayData.map(d => d.fullName));
        vis.x.domain([0, d3.max(vis.displayData, d => d.seasonalVisits[selectedSeason])])

        // Draw the layers
        const rectangles = vis.svg.selectAll(".bar").data(vis.displayData, d => d.id)

        rectangles
            .enter()
            .append("rect")
            .merge(rectangles)
            .attr("class", "bar")
            .attr("x", 0)
            .attr("height", vis.y.bandwidth())
            .transition()
            .attr("y", d => vis.y(d.fullName))
            .attr("width", d => vis.x(d.seasonalVisits[selectedSeason]))
            .duration(500)

        rectangles.exit().remove()

        // const labels = vis.svg.selectAll(".bar-label").data(vis.displayData, d => d.seasonalVisits[selectedSeason])
        // labels.exit().remove();
        //
        // labels
        //     .enter()
        //     .append("text")
        //     .attr("class", "bar-label")
        //     .attr("y", d => vis.y(d.fullName) + vis.y.bandwidth() / 2)
        //     .attr("x", d => (vis.lastValue[d.fullName] || 0) + 10)
        //     .text(d => d.seasonalVisits[selectedSeason])
        //     .transition()
        //     .attr("x", d => (vis.lastValue[d.fullName] = vis.x(d.seasonalVisits[selectedSeason])) + 10)
        //     .duration(500)

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").transition().call(vis.xAxis).duration(500);
        vis.svg.select(".y-axis").transition().call(vis.yAxis).duration(500);
    }
}
