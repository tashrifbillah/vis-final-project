//SVG sizes and margins
let margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 50
  },
  width = 850,
  height = 350;

//The number of columns and rows of the heatmap
let MapColumns = 30,
  MapRows = 20;

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
  .style("fill", "LightGray");




let state_points = []
let states = []
let california = {
  'name': 'CA',
  'region': 'West',
  'hex_locations': [[3, 10], [3, 11], [2, 11], [3, 12], [4, 12], [3, 13], [4, 13], [4, 14], [4, 13], [5, 14]]
};

let washington = {
  'name': 'WA',
  'region': 'West',
  'hex_locations': [[3, 4], [4, 4], [5, 4]]
};

states = [california, washington];

for (var state in states) {
  console.log(state)
  let hex_locations = states[state].hex_locations;
  console.log(hex_locations);
  for (let i = 0; i < hex_locations.length; i++) {
    let x = hexRadius * hex_locations[i][0] * Math.sqrt(3);
    console.log('shitting brix', hex_locations[i], hex_locations[i][0], hex_locations[i][1]);
    //Offset each uneven row by half of a "hex-width" to the right
    if (hex_locations[i][1] % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
    let y = hexRadius * hex_locations[i][1] * 1.5;
    state_points.push([x, y]);
  }
}

//Draw the hexagons
svg.append("g")
  .selectAll(".ca-hexagon")
  .data(hexbin(state_points))
  .enter().append("path")
  .attr("class", "ca-hexagon")
  .attr("d", function (d) {
    return "M" + d.x + "," + d.y + hexbin.hexagon();
  })
  .attr("stroke", "white")
  .attr("stroke-width", "1px")
  .style("fill", "Blue");