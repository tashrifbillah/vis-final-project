//SVG sizes and margins
let margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 500
  },
  width = 850,
  height = 350;

//The number of columns and rows of the heatmap
let MapColumns = 30,
  MapRows = 20;

//The maximum radius the hexagons can have to still fit the screen
let hexRadius = d3.min([width/((MapColumns + 0.5) * Math.sqrt(3)),
  height/((MapRows + 1/3) * 1.5)]);

// Initialize name converter
let myNameConverter = new NameConverter();

// Region colors
let regions = ["West", "Northeast", "South", "Midwest"]
let regionColors = ['#28794C', '#333577', '#AA8D39', '#AA5039']
let regionScale = d3.scaleOrdinal(regionColors)
  .domain(regions);

//Create SVG element
let svg = d3.select("#hex-map").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip
var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    let message;
    let header = '<h1>' + nameConverter.getFullName(d.name) + '</h1>'
    if (d.has_parks) {
      message = 'Has ' + d.hex_locations.length + ' national parks.';
    } else {
      message = 'Does not have any national parks.'
    }

    return header + message;
  });
svg.call(toolTip);

//Set the hexagon radius
let hexbin = d3.hexbin().radius(hexRadius);


//Calculate the center position of each hexagon
let points = [];
for (let i = 0; i < MapRows; i++) {
  for (let j = 0; j < MapColumns; j++) {
    let x = hexRadius * j * Math.sqrt(3)
    //Offset each uneven row by half of a "hex-width" to the right
    if(i%2 === 1) x += (hexRadius * Math.sqrt(3))/2
    let y = hexRadius * i * 1.5
    points.push([x,y])
  }//for j
}//for i


//Draw the hexagons
svg.append("g")
  .selectAll(".background-hexagon")
  .data(hexbin(points))
  .enter().append("path")
  .attr("class", "background-hexagon")
  .attr("d", function (d) {
    return "M" + d.x + "," + d.y + hexbin.hexagon();
  })
  .attr("stroke", "white")
  .attr("stroke-width", "1px")
  .style("fill", "LightGray")
  .style("opacity", 0.2);


let states;
d3.json("data/hex_cartogram_data.json")
  .then(data => {
    states = data;

    let state_points = []
    let state_objs = []
    let state_labels = []

    for (var state in states) {
      let hex_locations = states[state].hex_locations;

      for (let i = 0; i < hex_locations.length; i++) {
        let x = hexRadius * hex_locations[i][0] * Math.sqrt(3);
        //Offset each uneven row by half of a "hex-width" to the right
        if (hex_locations[i][1] % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
        let y = hexRadius * hex_locations[i][1] * 1.5;
        state_points.push([x, y]);
        let state_obj = Object.assign({}, states[state]);
        state_obj.hex_point =  [x, y]
        state_objs.push(state_obj)
      }

      // Do the same for the label tiles
      let label_location = states[state].label_location;
      let x = hexRadius * label_location[0] * Math.sqrt(3);
      //Offset each uneven row by half of a "hex-width" to the right
      if (label_location[1] % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
      let y = hexRadius * label_location[1] * 1.5;
      let label_obj = Object.assign({}, states[state]);
      label_obj.label_point = [x, y];
      state_labels.push(label_obj);
    }

    // console.log(state_objs);
    // console.log(state_labels);

    //Draw the hexagons
    let state_hexagons = svg.append("g")
      .selectAll(".state-hexagon")
      // .data(hexbin(state_points))
      .data(state_objs);

    state_hexagons
      .enter().append("path")
      .attr("class", "state-hexagon")
      .attr("d", function (d) {
        let hex_point_bin = hexbin([d.hex_point]);
        return "M" + hex_point_bin[0].x + "," + hex_point_bin[0].y + hexbin.hexagon();
      })
      .attr("stroke", "white")
      .attr("stroke-width", "1px")
      .style("fill", d => {
        if (d.has_parks == true) {
          return regionScale(myNameConverter.getRegion(myNameConverter.getFullName(d.name)));
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
        toolTip.show(d, this);
    })
      .on("mouseout", toolTip.hide);

    // Label the hexagons
    let state_hexagon_labels = svg.append("g")
      .selectAll(".state-hexagon-label")
      .data(state_labels);

    state_hexagon_labels
      .enter()//.merge(state_hexagons)
      .append("text")
      .attr("x", d => d.label_point[0] - hexRadius/2)
      .attr("y", d => d.label_point[1] + hexRadius/3)
      .attr("class", "state-label")
      .text(d => d.name)
      .style("font-size", 10)
      .on("mouseover", function(event, d) {
        toolTip.show(d, this);
      })
      .on("mouseout", toolTip.hide);
  })

// add legend
let legend = svg.append('g')
  .attr('class', 'legend')
  .attr("transform", `translate(0, ${height})`)
  .attr('text-anchor', 'start')

legend.selectAll(".legend-square")
  .data(regionColors)
  .enter()
  .append('rect')
  .attr("class", "legend-square")
  .attr("height", 20)
  .attr("width", 20)
  .attr("x", (d, i) => i * 100)
  .attr("y", 0)
  .attr("fill", d => d);

legend.selectAll(".legend-label")
  .data(regions)
  .enter()
  .append('text')
  .attr("class", "legend-label")
  .attr("x", (d, i) => i * 100 + 25)
  .attr("y", 20)
  .text(d => d);
