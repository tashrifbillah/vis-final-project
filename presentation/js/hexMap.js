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

        // Set up viewbox
        const width = 1200;
        const height = 700;

        vis.margin = {
            top: 50,
            right: 100,
            bottom: 100,
            left: 100,
        };

        vis.width = width - vis.margin.left - vis.margin.right;
        vis.height = height - vis.margin.top - vis.margin.bottom;

        // The number of columns and rows of the heatmap
        vis.MapColumns = 30;
        vis.MapRows = 20;

        // The maximum radius the hexagons can have to still fit the screen
        vis.hexRadius = d3.min([
            vis.width / ((vis.MapColumns + 0.5) * Math.sqrt(3)),
            vis.height / ((vis.MapRows + 1 / 3) * 1.5),
        ]);

        // Initialize name converter
        vis.myNameConverter = new NameConverter();

        // Region colors
        vis.regions = ['West', 'Northeast', 'South', 'Midwest', 'No Parks'];
        vis.regionColors = [sharedGreen, sharedBlue, sharedYellow, sharedRed, sharedGrey];
        vis.regionScale = d3.scaleOrdinal(vis.regionColors).domain(vis.regions);

        //Create SVG element
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('viewBox', [0, 0, width, height].join(' '))
            .append('g')
            .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')');

        // Tooltip
        vis.toolTip = d3
            .tip()
            .attr('class', 'd3-tip')
            .attr('height', 500)
            .direction(function (d, event) {
                if (event.clientX < window.innerWidth / 3) {
                    if (event.clientY < window.innerHeight / 2) {
                        return 'se';
                    } else {
                        return 'ne';
                    }
                } else if (event.clientX > (window.innerWidth * 2) / 3) {
                    if (event.clientY < window.innerHeight / 2) {
                        return 'sw';
                    } else {
                        return 'nw';
                    }
                } else if (event.clientY < window.innerHeight / 2) {
                    return 's';
                } else {
                    return 'n';
                }
            })
            .offset(function (d, event) {
                if (event.clientX < window.innerWidth / 3) {
                    if (event.clientY < window.innerHeight / 2) {
                        return [10, 0];
                    } else {
                        return [-10, 0];
                    }
                } else if (event.clientX > window.innerWidth / 2) {
                    if (event.clientY < window.innerHeight / 2) {
                        return [10, 0];
                    } else {
                        return [-10, 0];
                    }
                } else if (event.clientY < window.innerHeight / 2) {
                    return [10, 0];
                } else {
                    return [-10, 0];
                }
            })
            .html(function (d) {
                let message;
                let exclusive_message = '';
                let exclusive_list = '';
                let shared_message = '';
                let shared_list = '';
                let number_of_exclusive_parks = 0;

                if (d.has_parks) {
                    number_of_exclusive_parks = d.hex_locations.length;
                }
                let number_of_shared_parks = d.shared_hex_locations.length;
                let parks_in_state = getParksInState(allData, d.name);

                // Header to indicate state
                let header = '<h1>' + vis.myNameConverter.getFullName(d.name) + '</h1>';

                // Park message to describe the number of parks in a state
                if (d.has_parks) {
                    let parks;
                    switch (number_of_exclusive_parks) {
                        case 1:
                            parks = 'park';
                            break;
                        default:
                            parks = 'parks';
                    }
                    exclusive_message = d.name + ' has ' + number_of_exclusive_parks + ' exclusive national ' + parks;
                } else {
                    exclusive_message = 'Does not have any national parks';
                }

                // List the specific parks
                if (number_of_exclusive_parks != 0) {
                    exclusive_list = '</br>Exclusive Parks:</br>' + parks_in_state.exclusive.join('</br>') + '</br>';
                }
                if (number_of_shared_parks != 0) {
                    let parks;
                    switch (number_of_shared_parks) {
                        case 1:
                            parks = 'park';
                            break;
                        default:
                            parks = 'parks';
                    }
                    shared_message = ' and ' + number_of_shared_parks + ' shared national ' + parks;
                    shared_list = '</br>Shared Parks:</br>' + parks_in_state.shared.join('</br>');
                }
                message = exclusive_message + shared_message + '.';

                return header + message + '</br>' + exclusive_list + shared_list;
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
                let x = vis.hexRadius * j * Math.sqrt(3);
                //Offset each uneven row by half of a "hex-width" to the right
                if (i % 2 === 1) x += (vis.hexRadius * Math.sqrt(3)) / 2;
                let y = vis.hexRadius * i * 1.5;
                points.push([x, y]);
            } //for j
        } //for i

        //Draw the hexagons
        vis.svg
            .append('g')
            .selectAll('.background-hexagon')
            .data(vis.hexbin(points))
            .enter()
            .append('path')
            .attr('class', 'background-hexagon')
            .attr('d', function (d) {
                return 'M' + d.x + ',' + d.y + vis.hexbin.hexagon();
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '1px')
            .style('fill', sharedGrey)
            // .style("opacity", 0);
            .style('opacity', 0.2);

        let state_points = [];
        let state_objs = [];
        let state_labels = [];

        for (var state in vis.data) {
            let hex_locations = vis.data[state].hex_locations;
            let shared_hex_locations = vis.data[state].shared_hex_locations;

            // convert hex locations to hex points
            for (let i = 0; i < hex_locations.length; i++) {
                let x = vis.hexRadius * hex_locations[i][0] * Math.sqrt(3);
                //Offset each uneven row by half of a "hex-width" to the right
                if (hex_locations[i][1] % 2 === 1) x += (vis.hexRadius * Math.sqrt(3)) / 2;
                let y = vis.hexRadius * hex_locations[i][1] * 1.5;
                state_points.push([x, y]);
                let state_obj = Object.assign({}, vis.data[state]);
                state_obj.hex_point = [x, y];
                state_obj.shared = false;
                state_objs.push(state_obj);
            }

            // convert shared hex locations to shared hex points
            for (let i = 0; i < shared_hex_locations.length; i++) {
                let x = vis.hexRadius * shared_hex_locations[i][0] * Math.sqrt(3);
                //Offset each uneven row by half of a "hex-width" to the right
                if (shared_hex_locations[i][1] % 2 === 1) x += (vis.hexRadius * Math.sqrt(3)) / 2;
                let y = vis.hexRadius * shared_hex_locations[i][1] * 1.5;
                state_points.push([x, y]);
                let state_obj = Object.assign({}, vis.data[state]);
                state_obj.hex_point = [x, y];
                state_obj.shared = true;
                state_objs.push(state_obj);
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
        vis.state_hexagons = vis.svg.append('g').selectAll('.state-hexagon').data(state_objs);

        vis.state_hexagons
            .enter()
            .append('path')
            .attr('class', (d) => `state-hexagon state-hexagon-${d.name}`)
            .attr('d', function (d) {
                let hex_shape;
                let hex_point_bin = vis.hexbin([d.hex_point]);
                if (d.shared == true) {
                    switch (d.shared_hex_orientation) {
                        case 'left':
                            hex_shape = vis.getLeftHex(vis.hexbin.hexagon());
                            break;
                        case 'right':
                            hex_shape = vis.getRightHex(vis.hexbin.hexagon());
                            break;
                        default:
                            hex_shape = vis.getLeftHex(vis.hexbin.hexagon());
                    }
                } else {
                    hex_shape = vis.hexbin.hexagon();
                }
                return 'M' + hex_point_bin[0].x + ',' + hex_point_bin[0].y + hex_shape;
                // return "M" + hex_point_bin[0].x + "," + hex_point_bin[0].y + vis.getRightHex(vis.hexbin.hexagon());
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '1px')
            .style('fill', (d) => {
                if (d.has_parks == true) {
                    return vis.regionScale(vis.myNameConverter.getRegion(vis.myNameConverter.getFullName(d.name)));
                } else {
                    return sharedGrey;
                }
            })
            .style('opacity', (d) => {
                if (d.has_parks == true) {
                    return 0.75;
                } else {
                    return 0.5;
                }
            })
            .on('mouseover', function (event, d) {
                vis.toolTip.show(d, event, this);
                vis.svg.selectAll(`.state-hexagon-${d.name}`).style('opacity', 1);
            })
            .on('mouseout', function (event, d) {
                vis.toolTip.hide();
                vis.svg.selectAll(`.state-hexagon-${d.name}`).style('opacity', (d) => {
                    if (d.has_parks == true) {
                        return 0.75;
                    } else {
                        return 0.5;
                    }
                });
            });

        // Label the hexagons
        vis.state_hexagon_labels = vis.svg.append('g').selectAll('.state-hexagon-label').data(state_labels);

        vis.state_hexagon_labels
            .enter() //.merge(state_hexagons)
            .append('text')
            .attr('x', (d) => d.label_point[0] - vis.hexRadius / 2)
            .attr('y', (d) => d.label_point[1] + vis.hexRadius / 3)
            .attr('class', 'state-label')
            .text((d) => d.name)
            .on('mouseover', function (event, d) {
                vis.toolTip.show(d, event, this);
            })
            .on('mouseout', vis.toolTip.hide);

        // add legend
        vis.legend = vis.svg
            .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(0, ${vis.height})`)
            .attr('text-anchor', 'start');

        vis.legend
            .selectAll('.legend-square')
            .data(vis.regionColors)
            .enter()
            .append('rect')
            .attr('class', 'legend-square')
            .attr('height', 20)
            .attr('width', 20)
            .attr('x', (d, i) => i * 100)
            .attr('y', 0)
            .attr('fill', (d) => d);

        vis.legend
            .selectAll('.legend-label')
            .data(vis.regions)
            .enter()
            .append('text')
            .attr('class', 'legend-label')
            .attr('x', (d, i) => i * 100 + 25)
            .attr('y', 20)
            .text((d) => d);

        // add legend for exclusive park
        vis.legend
            .append('path')
            .attr('d', 'M' + 25 / 2 + ',' + 55 + vis.hexbin.hexagon())
            .style('stroke', 'black')
            .style('fill', 'none');

        // add label for exclusive park
        vis.legend
            .append('text')
            .attr('x', 25 / 2 + vis.hexRadius * 2)
            .attr('y', 60)
            .text('Exclusive Park');

        // add legend for shared park
        vis.legend
            .append('path')
            .attr('d', 'M' + (200 + 25 / 2) + ',' + 55 + vis.getLeftHex(vis.hexbin.hexagon()))
            .style('stroke', 'black')
            .style('fill', 'none');

        // add label for exclusive park
        vis.legend
            .append('text')
            .attr('x', 200 + 25 / 2 + vis.hexRadius)
            .attr('y', 60)
            .text('Shared Park');
    }

    // Return a right half of the hexagon component
    getRightHex(hexagonPath) {
        return hexagonPath.split('l').slice(0, 4).join('l') + 'z';
    }

    // Return a left half of the hexagon component
    getLeftHex(hexagonPath) {
        let startingPoint = hexagonPath.split('l')[0];
        let startingDrop =
            'l' +
            startingPoint
                .replace('m', '')
                .split(',')
                .map((d) => d * -2)
                .join(',');
        return startingPoint + startingDrop + 'l' + hexagonPath.split('l').slice(4).join('l') + 'z';
    }
}
