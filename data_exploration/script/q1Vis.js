/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

  constructor(parentElement, geoData, parkData) {
    this.parentElement = parentElement;
    this.geoData = geoData;
    this.parkData = parkData;

    this.initVis()
  }

  initVis() {
    let vis = this;


    vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


    vis.projection = d3.geoAlbersUsa()
      .translate([vis.width / 2, vis.height / 2])
      .scale(1000)

    vis.path = d3.geoPath()
      .projection(vis.projection);

    vis.usa = topojson
      .feature(vis.geoData, vis.geoData.objects.states)
      .features

    vis.states = vis.svg.selectAll(".state")
      .data(vis.usa)
      .enter()
      .append("path")
      .attr('class', 'state')
      .attr("d", vis.path)


    // append tooltip
    vis.tooltip = d3.select("body").append('div')
      .attr('class', "tooltip")


    vis.wrangleData()

  }


  wrangleData(){
    let vis = this;

    vis.updateVis()
  }



  updateVis(){
    let vis = this;

    // Remove parks w/o lat/long pair
    vis.parkData= vis.parkData.filter(d=>d.latLong && d)

    let circle= vis.svg.selectAll(".location")
      .data(vis.parkData)
      .enter()
      .append("circle")
      .attr("transform", d => {
        if (d.latitude && d.longitude) {
          let tmp = vis.projection([d.longitude, d.latitude])
          return tmp && `translate(${tmp})`
        }
        else {
          console.log(d.name)
        }
      })
      .attr("class", "location")
      .attr("fill", "lightskyblue")

    circle
      .on('mouseover', function (event, d) {

        d3.select(this)
          .attr('fill', 'red')

        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px")
          .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h5>${d.name}</h5>                
                     <h6>Location: ${d.location}</h6>
                     <h6>Established: ${d.date_established}</h6>
                     <h6>Area: ${d.area}</h6>
                 </div>`);

      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .attr('stroke-width', '0px')
          .attr("fill", "lightskyblue")

        vis.tooltip
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      })

    let table= document.getElementById("description")

    // Update table
    circle
      .on("click", (event, d) => {
        document.getElementById("picture").src= d.image
        document.getElementById("caption").innerHTML= `<h6>${d.name}</h6>`

        table.rows[0].cells[1].innerHTML= d.location
        table.rows[1].cells[1].innerHTML= d.date_established
        table.rows[2].cells[1].innerHTML= d.area
        table.rows[3].cells[1].innerHTML= d.visitors

      })




  }


}