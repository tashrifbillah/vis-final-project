/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, geoData, parkData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.parkData = parkData;
        this.displayData;

        this.initVis()
    }

    initVis() {
        let vis = this;

        const width = 1150
        const height = 600

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr('viewBox', [0, 0, width, height].join(' '))
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        vis.projection = geoAlbersUsaTerritories.geoAlbersUsaTerritories() // d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(1150)

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.usa = topojson
            .feature(vis.geoData, vis.geoData.objects.states)
            .features


        // .state path, .stateName, .location--all go under vis.gmap group
        vis.gmap= vis.svg.append("g")
        vis.gmap.selectAll(".state")
            .data(vis.usa)
            .enter()
            .append("path")
            .attr('class', 'state')
            .attr("d", vis.path)


        // Add state abbreviations
        vis.gmap.selectAll(".stateName")
            .data(vis.usa)
            .enter()
            .append("text")
            .attr("class", "stateName")
            .attr("x", d => {
                let tmp = d && vis.path.centroid(d)

                if (tmp[0]) {
                    // Add some offset so state label does not overlap circle
                    // return d.properties.name==='California'?tmp[0]-15:tmp[0]
                    switch (d.properties.name) {
                        case 'Alaska':
                        case 'California':
                        case 'Hawaii':
                        case 'United States Virgin Islands':
                            return tmp[0]-15
                        default:
                            return tmp[0]
                    }
                }
            })
            .attr("y", d => {
                let tmp = d && vis.path.centroid(d)
                if (tmp[1]) {
                    // Add some offset so state label does not overlap circle
                    // return d.properties.name==='South Carolina'?tmp[1]-10:tmp[1]
                    switch (d.properties.name) {
                        case 'American Samoa':
                        case 'Arkansas':
                        case 'Maryland':
                        case 'South Carolina':
                        case 'United States Virgin Islands':
                            return tmp[1]-10
                        default:
                            return tmp[1]
                    }

                }
            })
            .text(d => nameConverter.getAbbreviation(d.properties.name))


        /*
        Zoom and pan
        Own code, not copied from anywhere
        But studied the concept at http://bl.ocks.org/d3noob/5193723
         */
        vis.zoom = d3.zoom()
            .on("zoom",function(event) {

                vis.gmap.attr("transform",
                    `translate(${event.transform.x},${event.transform.y}),scale(${event.transform.k})`)

            })


        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")



        vis.wrangleData()

    }


    wrangleData() {
        let vis = this;

        vis.displayData= selectedRegion?
            vis.parkData.filter(d=>nameConverter.getRegion(d.location)==selectedRegion):vis.parkData


        // Empty the parkSelect menu
        $("#parkSelect").empty()

        // Populate the parkSelect menu with selectedRegion parks
        vis.displayData.sort((a,b)=>a.name>b.name?1:-1)
        vis.displayData.forEach(d=>$("#parkSelect").append(new Option(d.name,d.name)))

        // By default, display the first selectedRegion park in tabular summary
        tabularSummary(vis.displayData[0])

        vis.updateVis()

    }



    updateVis(){
        let vis = this;

        // Remove parks w/o lat/long pair
        // vis.parkData= vis.parkData.filter(d=>d.latLong && d)

        let tmp= vis.gmap.selectAll(".location")
            .data(vis.displayData, d=>d.name)

        let circle= tmp.enter()
            .append("circle")
            .attr('r', '10')
            .attr("transform", d => {
                let tmp = vis.projection([d.longitude, d.latitude])
                if (tmp) {
                    return `translate(${tmp})`
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

                // Update table
                tabularSummary(d)

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

        tmp.exit().remove()


        vis.svg.call(vis.zoom)
        

    }

}


function tabularSummary(d) {

    // change the parkSelect box text
    $('#parkSelect').val(d.name)

    let table= document.getElementById("description")

    document.getElementById("picture").src= d.image
    document.getElementById("caption").innerHTML= `<h5>${d.fullName}</h5>`

    table.rows[0].cells[1].innerHTML= d.location+ ` (${nameConverter.getAbbreviation(d.location)})`
    table.rows[1].cells[1].innerHTML= d.date_established
    table.rows[2].cells[1].innerHTML= d.area
    table.rows[3].cells[1].innerHTML= d.visitors


    document.getElementById("wiki").href= "https://en.wikipedia.org/wiki/"+ d.fullName.split(" ").join("_")

}