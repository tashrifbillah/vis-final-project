/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

class RadarChartClass {

  constructor(id, data, options, startSlice = 0, endSlice = 3) {
    this.id = id;
    this.data = data;
    this.options = options;
    this.startSlice = startSlice;
    this.endSlice = endSlice;

    this.initVis();
  }


  pullData() {
    let vis = this;

    if (topTenParks.length != 0) {
      // If we have determined the top ten matching parks then select from this array
      // Sort to ensure that order is always consistent
      let topTenParkNames = topTenParks.map(d => d.name);
      vis.displayParks = parkActivityScores
        .filter(d => {
          return topTenParkNames.slice(vis.startSlice, vis.endSlice).indexOf(d.parkName) != -1;
        })
        .sort((a, b) => topTenParkNames.indexOf(a.parkName) - topTenParkNames.indexOf(b.parkName));
    } else {
      vis.displayParks = parkActivityScores.sort(() => Math.random() - 0.5).slice(vis.startSlice, vis.endSlice);
    }
  }

  initVis() {
    let vis = this;

    vis.activityScores = vis.data.map(d => d.activityScores);

    vis.cfg = {
      w: 600,				//Width of the circle
      h: 600,				//Height of the circle
      margin: {top: 100, right: 50, bottom: 200, left: 50}, //The margins of the SVG
      levels: 3,				//How many levels or inner circles should there be drawn
      maxValue: 0, 			//What is the value that the biggest circle will represent
      labelFactor: 1.1, 	//How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
      opacityArea: 0.35, 	//The opacity of the area of the blob
      dotRadius: 4, 			//The size of the colored circles of each blog
      opacityCircles: 0.1, 	//The opacity of the circles of each blob
      strokeWidth: 2, 		//The width of the stroke around each blob
      roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scaleOrdinal(d3.schemeCategory10),	//Color function
      legend: false,  // Include a legend
      legendColumns: 3 // How many columns to use in the legend
    };

    vis.updateCfg();

    vis.pullData();

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(vis.id).select("svg").remove();

    //Initiate the radar chart SVG
    vis.svg = d3.select(vis.id).append("svg")
      .attr("width",  vis.cfg.w + vis.cfg.margin.left + vis.cfg.margin.right)
      .attr("height", vis.cfg.h + vis.cfg.margin.top + vis.cfg.margin.bottom)
      .attr("class", "radar"+vis.id);
    //Append a g element
    vis.g = vis.svg.append("g")
      .attr("transform", "translate(" + (vis.cfg.w/2 + vis.cfg.margin.left) + "," + (vis.cfg.h/2 + vis.cfg.margin.top) + ")");

    if (vis.cfg.legend == true) {
      // add legend
      vis.legend = vis.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(0, ${vis.cfg.h + vis.cfg.margin.top})`)
        .attr('text-anchor', 'start');
    }

    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    vis.filter = vis.g.append('defs').append('filter').attr('id','glow'),
    vis.feGaussianBlur = vis.filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
    vis.feMerge = vis.filter.append('feMerge'),
    vis.feMergeNode_1 = vis.feMerge.append('feMergeNode').attr('in','coloredBlur'),
    vis.feMergeNode_2 = vis.feMerge.append('feMergeNode').attr('in','SourceGraphic');


    //Wrapper for the grid & axes
    vis.axisGrid = vis.g.append("g").attr("class", "axisWrapper");

    vis.updateVis();

  }

  updateCfg() {
    let vis = this;

    //Put all of the options into a variable called cfg
    if ('undefined' !== typeof vis.options) {
      for (var i in vis.options) {
        if ('undefined' !== typeof vis.options[i]) {
          vis.cfg[i] = vis.options[i];
        }
      }//for i
    }//if

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    vis.maxValue = Math.max(vis.cfg.maxValue, d3.max(vis.activityScores, function(i){return d3.max(i.map(function(o){return o.value;}))}));

    vis.allAxis = (vis.activityScores[0].map(function(i, j){return i.axis})),	//Names of each axis
    vis.total = vis.allAxis.length,					//The number of different axes
    vis.radius = Math.min(vis.cfg.w/2, vis.cfg.h/2), 	//Radius of the outermost circle
    vis.Format = d3.format('.0%'),			 	//Percentage formatting
    vis.angleSlice = Math.PI * 2 / vis.total;		//The width in radians of each "slice"

    //Scale for the radius
    vis.rScale = d3.scaleLinear()
      .range([0, vis.radius])
      .domain([0, vis.maxValue]);
  }



  updateVis() {
    let vis = this;

    vis.pullData();

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

    //Draw the background circles
    vis.backgroundCircles = vis.axisGrid.selectAll('.gridCircle')
      .data(d3.range(1, (vis.cfg.levels + 1)).reverse());

    vis.backgroundCircles.enter()
      .merge(vis.backgroundCircles)
      .append('circle')
      .attr('class', 'gridCircle')
      .attr('r', function(d, i) {
        return vis.radius / vis.cfg.levels * d;
      })
      .style('fill', '#CDCDCD')
      .style('stroke', '#CDCDCD')
      .style('fill-opacity', vis.cfg.opacityCircles)
      .style('filter', 'url(#glow)');


    //Text indicating at what % each level is
    vis.axisLabels = vis.axisGrid.selectAll('.axisLabel')
      .data(d3.range(1, (vis.cfg.levels + 1)).reverse());

    vis.axisLabels.enter()
      .append('text')
      .attr('class', 'axisLabel')
      .attr('x', 4)
      .attr('y', function(d) {
        return -d * vis.radius / vis.cfg.levels;
      })
      .attr('dy', '0.4em')
      .style('font-size', '10px')
      .attr('fill', '#737373')
      .text(function(d, i) {
        return vis.Format(vis.maxValue * d / vis.cfg.levels);
      });

    vis.axisLabels.exit().remove()


    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////

    //Create the straight lines radiating outward from the center
    vis.axis = vis.axisGrid.selectAll('.axis')
      .data(vis.allAxis)
      .enter()
      .append('g')
      .attr('class', 'axis');
    //Append the lines
    vis.axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', function(d, i) {
        return vis.rScale(vis.maxValue * 1.1) * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr('y2', function(d, i) {
        return vis.rScale(vis.maxValue * 1.1) * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .attr('class', 'line')
      .style('stroke', 'white')
      .style('stroke-width', '2px');

    //Append the labels at each axis
    vis.axis.append('text')
      .attr('class', 'legend')
      .style('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', function(d, i) {
        return vis.rScale(vis.maxValue * vis.cfg.labelFactor) * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr('y', function(d, i) {
        return vis.rScale(vis.maxValue * vis.cfg.labelFactor) * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .text(function(d) {
        return d;
      })
      .call(vis.wrap, vis.cfg.wrapWidth);

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    vis.radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(function(d) {
        return vis.rScale(d.value);
      })
      .angle(function(d, i) {
        return i * vis.angleSlice;
      });

    if (vis.cfg.roundStrokes) {
      vis.radarLine.curve(d3.curveCardinalClosed);
    }


    //Append the backgrounds
    vis.blobAreas = vis.g.selectAll(".radarArea")
      .data(vis.displayParks);

    vis.blobAreas.enter()
      .append('path')
      .attr('class', 'radarArea')
      .on('mouseover', function(event, d) {
        // Update tooltip
        vis.radarToolTip.show(d, 'PARK', this);

        //Dim all blobs
        d3.selectAll('.radarArea')
          .transition("dim").duration(200)
          .style('fill-opacity', 0.1);
        //Bring back the hovered over blob
        d3.select(this)
          .transition("highlight").duration(200)
          .style('fill-opacity', 0.7);
      })
      .on('mouseout', function() {
        // Hide tooltip
        vis.radarToolTip.hide();

        //Bring back all blobs
        d3.selectAll('.radarArea')
          .transition("restore").duration(200)
          .style('fill-opacity', vis.cfg.opacityArea);
      })
      .merge(vis.blobAreas)
      .transition("transitionBlobAreas")
      .duration(800)
      .attr('d', function(d, i) {
        return vis.radarLine(d.activityScores);
      })
      .style('fill', function(d, i) {
        return vis.cfg.color(i);
      })
      .style('fill-opacity', vis.cfg.opacityArea);

    vis.blobAreas.exit().remove();


    //Create the outlines
    vis.blobOutlines = vis.g.selectAll(".radarStroke")
      .data(vis.displayParks);

    vis.blobOutlines
      .enter()
      .append('path')
      .attr('class', 'radarStroke')
      .merge(vis.blobOutlines)
      .transition("transitionBlobOutlines")
      .duration(800)
      .attr('d', function(d, i) {
        return vis.radarLine(d.activityScores);
      })
      .style('stroke-width', vis.cfg.strokeWidth + 'px')
      .style('stroke', function(d, i) {
        return vis.cfg.color(i);
      })
      .style('fill', 'none')
      .style('filter', 'url(#glow)');

    vis.blobOutlines.exit().remove();


    // Set up  a  wrapper group for the visible circles
    vis.circleWrapper = vis.g.selectAll('.radarCircleWrapperVisible')
      .data(vis.displayParks);

    vis.circleWrapper.enter().append('g')
      .attr('class', 'radarCircleWrapperVisible');

    vis.circleWrapper = vis.g.selectAll('.radarCircleWrapperVisible')
      .data(vis.displayParks);

    //Append a set of circles for each data point
    vis.blobCircles = vis.circleWrapper.selectAll('.radarCircle')
      .data(function(d, i) {
        return d.activityScores;
      })


    let j = -1;  // Hacky solution for missing group index
    // Append the circles
    vis.blobCircles.enter()
      .append('circle')
      .attr('class', 'radarCircle')
      .merge(vis.blobCircles)
      .transition("transitionBlobCircles")
      .duration(800)
      .attr('r', vis.cfg.dotRadius)
      .attr('cx', function(d, i) {
        return vis.rScale(d.value) * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr('cy', function(d, i) {
        return vis.rScale(d.value) * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .style('fill', function() {
        j++;
        return vis.cfg.color(Math.floor(j / vis.data[0].activityScores.length));
      }) // Hacky solution for missing group index
      .style('fill-opacity', 0.8);

    vis.blobCircles.exit().remove();


    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    vis.blobCircleWrapper = vis.g.selectAll('.radarCircleWrapper')
      .data(vis.displayParks);

    vis.blobCircleWrapper.enter().append('g')
      .attr('class', 'radarCircleWrapper');

    vis.blobCircleWrapper = vis.g.selectAll('.radarCircleWrapper')
      .data(vis.displayParks);

    //Append a set of invisible circles on top for the mouseover pop-up
    vis.invisibleCircles = vis.blobCircleWrapper.selectAll('.radarInvisibleCircle')
      .data(function(d, i) {
        return d.activityScores;
      })

    vis.invisibleCircles
      .enter().append('circle')
      .attr('class', 'radarInvisibleCircle')
      .merge(vis.invisibleCircles)
      .attr('r', vis.cfg.dotRadius * 1.5)
      .attr('cx', function(d, i) {
        return vis.rScale(d.value) * Math.cos(vis.angleSlice * i - Math.PI / 2);
      })
      .attr('cy', function(d, i) {
        return vis.rScale(d.value) * Math.sin(vis.angleSlice * i - Math.PI / 2);
      })
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function(event, d) {
        // Update tooltip
        vis.radarToolTip.show(d, 'CIRCLE', this);
        console.log(d);
      })
      .on('mouseout', function() {
        vis.radarToolTip.hide();
      });


    // Optionally add the legend
    if (vis.cfg.legend == true) {
      vis.legendSquares = vis.legend.selectAll('.legend-square')
        .data(vis.cfg.color.range());

      vis.legendSquares.enter()
        .append('rect')
        .attr('class', 'legend-square')
        .merge(vis.legendSquares)
        .attr('height', 20)
        .attr('width', 20)
        .attr('x', (d, i) => (i % vis.cfg.legendColumns) * (vis.cfg.w + vis.cfg.margin.left + vis.cfg.margin.right) / vis.cfg.legendColumns)
        .attr('y', vis.cfg.margin.bottom/2)
        .attr('fill', d => d);

      vis.legendLabels = vis.legend.selectAll('.legend-label')
        .data(vis.displayParks);

      vis.legendLabels.enter()
        .append('text')
        .attr('class', 'legend-label')
        .merge(vis.legendLabels)
        .attr('x', (d, i) => (i % vis.cfg.legendColumns) * (vis.cfg.w + vis.cfg.margin.left + vis.cfg.margin.right) / vis.cfg.legendColumns + 25)
        .attr('y', vis.cfg.margin.bottom/2 + 20)
        .text(d => d.parkName);
    }


    // Radar Tooltip
    vis.radarToolTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d, t) {
        let message = '';
        let header = '<h1>' + d.parkName + '</h1>';
        let sortedActivities;

        if (t == 'PARK') {
          sortedActivities = activityMatch(d.activities);
          message = 'You might enjoy some of these activities at ' + d.parkName + ': ' + sortedActivities.slice(0, 3).join(", ");
        } else if (t == 'CIRCLE') {
          // Not all parks have 3 activities in each category
          if (d.numberMatching == 0) {
            message = d.parkName + ' does not currently offer any activities related to ' + d.axis;
          } else {
            sortedActivities = activityMatch(d.matchingActivities);
            message = d.parkName + ' offers activities such as: ' + sortedActivities.slice(0, 3).join(", ");
          }
        }
        return header + message;
      });

    // Add the tooltip
    vis.svg.call(vis.radarToolTip);
  }

  /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }//wrap

}//RadarChart