/* * * * * * * * * * * * * *
 *          MapVis          *
 * * * * * * * * * * * * * */

class MapVis {
    constructor(parentElement, geoData, parkData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.parkData = parkData;
        this.displayData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const width = 1150;
        const height = 600;

        vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };
        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', [0, 0, width, height].join(' '))
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.projection = geoAlbersUsaTerritories
            .geoAlbersUsaTerritories() // d3.geoAlbersUsa()
            .translate([vis.width / 2, vis.height / 2])
            .scale(1150);

        vis.path = d3.geoPath().projection(vis.projection);

        vis.usa = topojson.feature(vis.geoData, vis.geoData.objects.states).features;

        // .state path, .stateName, .location--all go under vis.gmap group
        vis.gmap = vis.svg.append('g');
        vis.gmap.selectAll('.state').data(vis.usa).enter().append('path').attr('class', 'state').attr('d', vis.path);

        // Add state abbreviations
        vis.gmap
            .selectAll('.stateName')
            .data(vis.usa)
            .enter()
            .append('text')
            .attr('class', 'stateName')
            .attr('x', (d) => {
                let tmp = d && vis.path.centroid(d);

                if (tmp[0]) {
                    // Add some offset so state label does not overlap circle
                    // return d.properties.name==='California'?tmp[0]-15:tmp[0]
                    switch (d.properties.name) {
                        case 'Alaska':
                        case 'California':
                        case 'Hawaii':
                        case 'United States Virgin Islands':
                        case 'Commonwealth of the Northern Mariana Islands':
                        case 'Guam':
                        case 'American Samoa':
                        case 'Louisiana':
                            return tmp[0] - 15;
                        case 'Florida':
                            return tmp[0] + 15;
                        default:
                            return tmp[0];
                    }
                }
            })
            .attr('y', (d) => {
                let tmp = d && vis.path.centroid(d);
                if (tmp[1]) {
                    // Add some offset so state label does not overlap circle
                    // return d.properties.name==='South Carolina'?tmp[1]-10:tmp[1]
                    switch (d.properties.name) {
                        case 'American Samoa':
                        case 'Arkansas':
                        case 'Maryland':
                        case 'South Carolina':
                        case 'United States Virgin Islands':
                        case 'Puerto Rico':
                            return tmp[1] - 10;
                        case 'Hawaii':
                            return tmp[1] + 10;
                        default:
                            return tmp[1];
                    }
                }
            })
            .text((d) => nameConverter.getAbbreviation(d.properties.name));

        /*
        Zoom and pan
        Own code, not copied from anywhere
        But studied the concept at http://bl.ocks.org/d3noob/5193723
         */
        vis.zoom = d3
            .zoom()
            .scaleExtent([0.8, 3])
            .on('zoom', (event) => vis.gmap.attr('transform', event.transform));

        d3.select('#zoom_reset').on('click', (event) =>
            vis.svg.transition().duration(500).call(vis.zoom.transform, d3.zoomIdentity),
        );
        d3.select('#zoom_in').on('click', (event) => vis.zoom.scaleBy(vis.svg.transition().duration(500), 1.2));
        d3.select('#zoom_out').on('click', (event) => vis.zoom.scaleBy(vis.svg.transition().duration(500), 0.8));

        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = selectedRegion
            ? vis.parkData.filter((d) => nameConverter.getRegion(d.location) == selectedRegion)
            : vis.parkData;

        // Empty the parkSelect menu
        $('#parkSelect').empty();

        // Populate the parkSelect menu with selectedRegion parks
        vis.displayData.sort((a, b) => (a.name > b.name ? 1 : -1));
        vis.displayData.forEach((d) => $('#parkSelect').append(new Option(d.name, d.name)));

        // By default, display the first selectedRegion park in tabular summary
        tabularSummary(vis.displayData[0]);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let tmp = vis.gmap.selectAll('.location').data(vis.displayData, (d) => d.name);

        let circle = tmp
            .enter()
            .append('circle')
            .attr('r', '10')
            .attr('transform', (d) => {
                let tmp = vis.projection([d.longitude, d.latitude]);
                if (tmp) {
                    return `translate(${tmp})`;
                } else {
                    console.log(d.name);
                }
            })
            .attr('class', 'location')
            .attr('fill', sharedGreen);

        circle
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', sharedRed);

                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 'px').html(`
                 <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                     <h6>${d.name}</h6>
                     Location: ${d.location}<br>
                     Established: ${d.date_established}<br>
                     Area: ${d.area}<br>
                 </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('stroke-width', '0px').attr('fill', sharedGreen);

                vis.tooltip.style('opacity', 0).style('left', 0).style('top', 0).html(``);
            })
            // Update table
            .on('click', (event, d) => tabularSummary(d));

        tmp.exit().remove();

        vis.svg
            .call(vis.zoom)
            // Prevent annoying webpage scroll upon reaching scaleExtent()
            .on('wheel', (event) => event.preventDefault());
    }
}

function tabularSummary(d) {
    // change the parkSelect box text
    $('#parkSelect').val(d.name);

    let table = document.getElementById('description');

    document.getElementById('picture').src = d.image;
    document.getElementById('caption').innerHTML = `<h6>${d.fullName}</h6>`;

    table.rows[0].cells[1].innerHTML = d.location;
    table.rows[1].cells[1].innerHTML = d.date_established;
    let tmp = d.area.split('acres ');
    table.rows[2].cells[1].innerHTML = `${tmp[0]} acres <br>${tmp[1]}</br>`;
    table.rows[3].cells[1].innerHTML = d.visitors;

    document.getElementById('wiki').href =
        'https://en.wikipedia.org/wiki/' + d.fullName.replace('&', 'and').split(' ').join('_');
}
