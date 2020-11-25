/* * * * * * * * * * * * * *
*      class HexMap        *
* * * * * * * * * * * * * */

class HexMap {
    constructor(parentElement, data) {
      this.parentElement = parentElement;
      this.data = data;

      this.initVis();
    }

    initVis() {
      let vis = this;

      vis.margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 100
      };
      vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
      vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

      // The number of columns and rows of the heatmap
      vis.MapColumns = 30;
      vis.MapRows = 20;

      // The maximum radius the hexagons can have to still fit the screen
      vis.hexRadius = d3.min([vis.width/((vis.MapColumns + 0.5) * Math.sqrt(3)),
        vis.height/((vis.MapRows + 1/3) * 1.5)]);

      // Initialize name converter
      vis.myNameConverter = new NameConverter();

      // Region colors
      vis.regions = ["West", "Northeast", "South", "Midwest", "No Parks"]
      vis.regionColors = ['#28794C', '#333577', '#AA8D39', '#AA5039', "#D3D3D3"]
      vis.regionScale = d3.scaleOrdinal(vis.regionColors)
        .domain(vis.regions);

      //Create SVG element
      vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

      // Tooltip
      vis.toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
          let message;
          let header = '<h1>' + vis.myNameConverter.getFullName(d.name) + '</h1>'
          if (d.has_parks) {
            message = 'Has ' + d.hex_locations.length + ' national parks.';
          } else {
            message = 'Does not have any national parks.';
          }
          return header + message;
        });
      vis.svg.call(vis.toolTip);

      //Set the hexagon radius
      vis.hexbin = d3.hexbin().radius(vis.hexRadius);

      vis.updateVis();
    }

    updateVis() {
      let vis = this;

      //Calculate the center position of each hexagon
      let points = [];
      for (let i = 0; i < vis.MapRows; i++) {
        for (let j = 0; j < vis.MapColumns; j++) {
          let x = vis.hexRadius * j * Math.sqrt(3)
          //Offset each uneven row by half of a "hex-width" to the right
          if(i%2 === 1) x += (vis.hexRadius * Math.sqrt(3))/2
          let y = vis.hexRadius * i * 1.5
          points.push([x,y])
        }//for j
      }//for i

      //Draw the hexagons
      vis.svg.append("g")
        .selectAll(".background-hexagon")
        .data(vis.hexbin(points))
        .enter().append("path")
        .attr("class", "background-hexagon")
        .attr("d", function (d) {
          return "M" + d.x + "," + d.y + vis.hexbin.hexagon();
        })
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .style("fill", "LightGray")
        .style("opacity", 0.2);



      let state_points = []
      let state_objs = []
      let state_labels = []

      for (var state in vis.data) {
        let hex_locations = vis.data[state].hex_locations;

        for (let i = 0; i < hex_locations.length; i++) {
          let x = vis.hexRadius * hex_locations[i][0] * Math.sqrt(3);
          //Offset each uneven row by half of a "hex-width" to the right
          if (hex_locations[i][1] % 2 === 1) x += (vis.hexRadius * Math.sqrt(3)) / 2;
          let y = vis.hexRadius * hex_locations[i][1] * 1.5;
          state_points.push([x, y]);
          let state_obj = Object.assign({}, vis.data[state]);
          state_obj.hex_point =  [x, y]
          state_objs.push(state_obj)
        }

        // Do the same for the label tiles
        let label_location = vis.data[state].label_location;
        let x = vis.hexRadius * label_location[0] * Math.sqrt(3);
        //Offset each uneven row by half of a "hex-width" to the right
        if (label_location[1] % 2 === 1) x += (vis.hexRadius * Math.sqrt(3)) / 2;
        let y = vis.hexRadius * label_location[1] * 1.5;
        let label_obj = Object.assign({}, vis.data[state]);
        label_obj.label_point = [x, y];
        state_labels.push(label_obj);
      }

      // console.log(state_objs);
      // console.log(state_labels);

      //Draw the hexagons
      vis.state_hexagons = vis.svg.append("g")
        .selectAll(".state-hexagon")
        .data(state_objs);

      vis.state_hexagons
        .enter().append("path")
        .attr("class", "state-hexagon")
        .attr("d", function (d) {
          let hex_point_bin = vis.hexbin([d.hex_point]);
          return "M" + hex_point_bin[0].x + "," + hex_point_bin[0].y + vis.hexbin.hexagon();
        })
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .style("fill", d => {
          if (d.has_parks == true) {
            return vis.regionScale(vis.myNameConverter.getRegion(vis.myNameConverter.getFullName(d.name)));
          } else {
            return "LightGray";
          }
        })
        .style("opacity", d => {
          if (d.has_parks == true) {
            return 0.8;
          } else {
            return 0.5;
          }
        })
        .on("mouseover", function(event, d) {
          vis.toolTip.show(d, this);
        })
        .on("mouseout", vis.toolTip.hide);

      // Label the hexagons
      vis.state_hexagon_labels = vis.svg.append("g")
        .selectAll(".state-hexagon-label")
        .data(state_labels);

      vis.state_hexagon_labels
        .enter()//.merge(state_hexagons)
        .append("text")
        .attr("x", d => d.label_point[0] - vis.hexRadius/2)
        .attr("y", d => d.label_point[1] + vis.hexRadius/3)
        .attr("class", "state-label")
        .text(d => d.name)
        .on("mouseover", function(event, d) {
          vis.toolTip.show(d, this);
        })
        .on("mouseout", vis.toolTip.hide);

      // add legend
      vis.legend = vis.svg.append('g')
        .attr('class', 'legend')
        .attr("transform", `translate(0, ${vis.height})`)
        .attr('text-anchor', 'start')

      vis.legend.selectAll(".legend-square")
      .data(vis.regionColors)
      .enter()
      .append('rect')
      .attr("class", "legend-square")
      .attr("height", 20)
      .attr("width", 20)
      .attr("x", (d, i) => i * 100)
      .attr("y", 0)
      .attr("fill", d => d);

    vis.legend.selectAll(".legend-label")
      .data(vis.regions)
      .enter()
      .append('text')
      .attr("class", "legend-label")
      .attr("x", (d, i) => i * 100 + 25)
      .attr("y", 20)
      .text(d => d);

    }
}