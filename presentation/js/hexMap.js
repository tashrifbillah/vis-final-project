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
let MapColumns = 22,
  MapRows = 14;

//The maximum radius the hexagons can have to still fit the screen
let hexRadius = d3.min([width/((MapColumns + 0.5) * Math.sqrt(3)),
  height/((MapRows + 1/3) * 1.5)]);

//Create SVG element
let svg = d3.select("#hex-map").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

console.log("YMMY HEXIES, ", hexbin(points))

let states;
d3.json("data/hex_cartogram_data.json")
  .then(data => {
    states = data;



    console.log(states);
    let state_points = []
    let state_objs = []

    for (var state in states) {
      console.log(state)
      let hex_locations = states[state].hex_locations;
      let state_hex_points = []
      console.log(hex_locations);
      for (let i = 0; i < hex_locations.length; i++) {
        let x = hexRadius * hex_locations[i][0] * Math.sqrt(3);
        console.log('shitting brix', hex_locations[i], hex_locations[i][0], hex_locations[i][1]);
        //Offset each uneven row by half of a "hex-width" to the right
        if (hex_locations[i][1] % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
        let y = hexRadius * hex_locations[i][1] * 1.5;
        state_points.push([x, y]);
        let state_obj = Object.assign({}, states[state]);
        state_obj.hex_point =  [x, y]
        state_objs.push(state_obj)
      }
    }

    console.log(state_objs)

    //Draw the hexagons
    let state_hexagons = svg.append("g")
      .selectAll(".state-hexagon")
      // .data(hexbin(state_points))
      .data(state_objs);

    state_hexagons
      .enter().append("path")
      .attr("class", "state-hexagon")
      .attr("d", function (d) {
        console.log(d.hex_point)
        let hex_point_bin = hexbin([d.hex_point]);
        console.log("HEXHAW", hex_point_bin)
        return "M" + hex_point_bin[0].x + "," + hex_point_bin[0].y + hexbin.hexagon();
      })
      .attr("stroke", "white")
      .attr("stroke-width", "1px")
      .style("fill", d => {
        if (d.has_parks == true) {
          return "Blue";
        } else {
          return "LightGray";
        }
      })
      .style("opacity", 0.5);

    state_hexagons
      .enter()//.merge(state_hexagons)
      .append("text")
      .attr("x", d => d.hex_point[0] - hexRadius/2)
      .attr("y", d => d.hex_point[1] + hexRadius/2)
      .attr("class", "state-label")
      .text(d => d.name)
      .style("font-size", 10);
  })
