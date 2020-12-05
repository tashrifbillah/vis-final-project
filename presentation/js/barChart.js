let selectedSeason = "Summer"

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


        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleBand(d3.schemeCategory10)
            .padding(0.1)
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(6)


        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // y axis title
        vis.svg.append("text")
            .attr("x", vis.width/2)
            .attr("y", -10)
            .attr("class", "axis-title")

        // (Filter, aggregate, modify data)
        vis.wrangleData();


        vis.toolTip = d3.tip()
          .attr("class", "d3-tip")
          .attr("height", 500)
          .offset(function(d) {
              if (vis.x(d.seasonalVisits[selectedSeason]) > vis.width - 100) {
                  if (vis.y(`${d.name}, ${nameConverter.getAbbreviation(d.location)}`) < vis.height / 2) {
                      return [10, 0];
                  } else {
                      return [-10, 0];
                  }
              } else {
                  return [0, 50];
              }
          })
          .direction(function(d) {
              if (vis.x(d.seasonalVisits[selectedSeason]) > vis.width - 100) {
                  if (vis.y(`${d.name}, ${nameConverter.getAbbreviation(d.location)}`) < vis.height / 2) {
                      return 's';
                  } else {
                      return 'n';
                  }
              } else {
                  return 'e';
              }
          })
          .html(function(d) {
              let header = `<h1>${d.name}</h1>`
              let message = `
              <table class="table" style="margin-bottom: 0; font-family: Monospace">
                  <tbody>
                      <tr>
                          <td>${seasons[0]}</td>
                          <td>${d3.format(",")(d.seasonalVisits[seasons[0]])}</td>
                      </tr>
                      <tr>
                          <td>${seasons[1]}</td>
                          <td>${d3.format(",")(d.seasonalVisits[seasons[1]])}</td>
                      </tr>
                      <tr>
                          <td>${seasons[2]}</td>
                          <td>${d3.format(",")(d.seasonalVisits[seasons[2]])}</td>
                      </tr>
                  </tbody>
              </table>
              `
              return header  + message;
          });
        vis.svg.call(vis.toolTip);
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        vis.displayData = topTenParks.length ? topTenParks : vis.data;

        // As default, the fist 10 least visited parks of selectedSeason are shown
        vis.displayData.sort((a, b) => (a.seasonalVisits[selectedSeason] - b.seasonalVisits[selectedSeason]) * popularFirst)
        vis.displayData = vis.displayData.slice(0, 10)

        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;
        let trans_time = 1500

        vis.y.domain(vis.displayData.map(d => `${d.name}, ${nameConverter.getAbbreviation(d.location)}`))

        // Inner loop computes maximum over all seasons for each park
        // Outer loop computer maximum over all parks
        vis.x.domain([0, d3.max( vis.displayData, d => d3.max( seasons.map(s => d.seasonalVisits[s]) ) ) ])

        // Draw the layers
        const rectangles = vis.svg.selectAll(".bar").data(vis.displayData, d => d.id)

        rectangles
            .enter()
            .append("rect")
            .merge(rectangles)
            .attr("class", "bar")
            .on("mouseover", function(event, d) {
                vis.toolTip.show(d, this);
                d3.select(this)
                  .style("stroke", sharedYellow)
                  .style("stroke-width", 3);
            })
            .on("mouseout", function() {
                vis.toolTip.hide()
                d3.select(this)
                  .style("stroke", "black")
                  .style("stroke-width", 1);
            })
            .attr("x", 0)
            .attr("height", vis.y.bandwidth())
            .transition()
            .duration(trans_time)
            .attr("y", d => vis.y(`${d.name}, ${nameConverter.getAbbreviation(d.location)}`))
            .attr("width", d => vis.x(d.seasonalVisits[selectedSeason]))


        rectangles.exit().remove()



        // labels
        let labels= vis.svg.selectAll(".count")
            .data(vis.displayData, d => d.id)

        labels.enter()
            .append("text")
            .attr("class", "count")
            .merge(labels)
            .transition()
            .duration(trans_time)
            .text((d) => d3.format(',')(d.seasonalVisits[selectedSeason]))
            .attr("y", d => vis.y(`${d.name}, ${nameConverter.getAbbreviation(d.location)}`)+vis.y.bandwidth()/2)
            .attr("x", d => vis.x(d.seasonalVisits[selectedSeason])+5)


        labels.exit().remove()


        const sortLabel = popularFirst > 0 ? "Most popular" : "Least crowded"

        // Update the y-axis
        vis.svg.select(".axis-title")
            .text(`${sortLabel} 10 matching parks' average monthly visits in ${selectedSeason}`)


        // Call axis functions with the new domain
        vis.svg.select(".x-axis").transition().duration(trans_time).call(vis.xAxis)
        vis.svg.select(".y-axis").transition().duration(trans_time).call(vis.yAxis)
    }
}
