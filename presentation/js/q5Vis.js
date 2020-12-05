/* * * * * * * * * * * * * *
 *          LineVis         *
 * * * * * * * * * * * * * */

class LineVis {
    constructor(parentElement, parkData) {
        this.parentElement = parentElement;
        this.parkData = parkData;
        this.displayData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 20, left: 90 };
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3
            .select('#' + vis.parentElement)
            .append('svg')
            .attr('width', vis.width + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Scales and Axes
        vis.x = d3.scaleBand().range([vis.margin.left, vis.width]);
        vis.xAxis = d3.axisBottom();

        vis.y = d3.scaleLinear().range([vis.height, vis.margin.top]);
        vis.yAxis = d3.axisLeft().ticks(8);

        vis.gx = vis.svg
            .append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(' + 0 + ',' + `${vis.height + 15}` + ')');

        vis.gy = vis.svg
            .append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(' + vis.margin.left + ',' + '10)');

        vis.gy.append('text').attr('y', 5).attr('class', 'title y-title');

        // Group of pattern elements
        vis.patterng = vis.svg.append('g');

        // Path
        vis.path = vis.patterng.append('path').attr('class', 'path');

        vis.path1 = vis.patterng.append('path').attr('class', 'path');

        // Draw path
        vis.trend = d3
            .line()
            .curve(d3.curveCardinal)
            .y((d) => vis.y(d.visit));

        // Append tooltip
        vis.tooltip = d3.select('body').append('div').attr('class', 'tooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        document.getElementsByClassName('s2m_details')[0].style.display = 'none';

        let monthly = vis.parkData.map((d) => d['monthly visit']);

        vis.y2019 = [];
        vis.y2020 = [];

        if (groupBy === 'months' || groupBy === 'seasons') {
            months.forEach((m) =>
                vis.y2019.push({
                    group: m,
                    visit: monthly.map((d) => (d[m] ? d[m][m + ' 2019'] : 0)).reduce((a, v) => a + v, 0),
                }),
            );

            months.forEach((m) =>
                vis.y2020.push({
                    group: m,
                    visit: monthly.map((d) => (d[m] ? d[m][m + ' 2020'] : 0)).reduce((a, v) => a + v, 0),
                }),
            );

            vis.groups = months;
            vis.svg.select('.y-title').text('Monthly visits');
        } else if (groupBy == 'ytd') {
            months.forEach((m) =>
                vis.y2019.push({
                    group: m,
                    visit: monthly.map((d) => (d[m] ? d[m]['YTD 2019'] : 0)).reduce((a, v) => a + v, 0),
                }),
            );

            months.forEach((m) =>
                vis.y2020.push({
                    group: m,
                    visit: monthly.map((d) => (d[m] ? d[m]['YTD 2020'] : 0)).reduce((a, v) => a + v, 0),
                }),
            );

            vis.groups = months;
            vis.svg.select('.y-title').text('Year to date visits');
        }

        if (groupBy == 'seasons') {
            vis.y2019 = seasonalAvg(vis.y2019);
            vis.y2020 = seasonalAvg(vis.y2020);

            // Override with seasons
            vis.groups = seasons;
            vis.svg.select('.y-title').text('Monthly average visits');

            document.getElementsByClassName('s2m_details')[0].style.display = 'block';
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.x.domain(vis.groups);
        vis.xAxis.scale(vis.x);
        vis.gx.transition().duration(1000).call(vis.xAxis);

        vis.y.domain([0, d3.max([vis.y2019.map((d) => d.visit), vis.y2020.map((d) => d.visit)].flat())]);
        vis.yAxis.scale(vis.y);
        vis.gy.transition().duration(1000).call(vis.yAxis);

        vis.trend.x((d, i) => vis.x(vis.groups[i]));

        vis.patterng.attr('transform', `translate(${vis.x.bandwidth() / 2},10)`);

        let tmp = vis.patterng.selectAll('.numVisit').data(vis.y2019, (d) => d.group);

        let circle = tmp.enter().append('circle').merge(tmp);

        circle
            .transition()
            .duration(1000)
            .attr('cx', (d) => vis.x(d.group))
            .attr('cy', (d) => vis.y(d.visit))
            .attr('class', 'point numVisit')
            .attr('fill', sharedBlue);

        // Tooltip for 2019
        vis.showTooltip(circle, sharedBlue, 2019);

        vis.path
            .datum(vis.y2019)
            .transition()
            .duration(1000)
            .attr('d', vis.trend)
            .attr('stroke', 'black')
            .attr('fill', 'none');

        let tmp1 = vis.patterng.selectAll('.numVisit1').data(vis.y2020, (d) => d.group);

        let circle1 = tmp1.enter().append('circle').merge(tmp1);

        circle1
            .transition()
            .duration(1000)
            .attr('cx', (d) => vis.x(d.group))
            .attr('cy', (d) => vis.y(d.visit))
            .attr('class', 'point numVisit1')
            .attr('fill', sharedRed);

        // Tooltip for 2020
        vis.showTooltip(circle1, sharedRed, 2020);

        vis.path1
            .datum(vis.y2020)
            .transition()
            .duration(1000)
            .attr('d', vis.trend)
            .attr('stroke', 'black')
            .attr('fill', 'none');

        tmp.exit().remove();
        tmp1.exit().remove();
    }

    showTooltip(circle, color, year) {
        let vis = this;

        circle
            .on('mouseover', function (event, d) {
                d3.select(this).attr('fill', sharedYellow);

                vis.tooltip
                    .style('opacity', 1)
                    .style('left', event.pageX + 20 + 'px')
                    .style('top', event.pageY + 'px').html(`
                 <div style="background: rgba(0, 0, 0, 0.8); color: #fff; border-radius: 2px; padding: 12px">
                     <h6>${d.group} ${year}</h6>
                     Visits: ${d3.format(',')(d.visit)}
                 </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).attr('fill', color);

                vis.tooltip.style('opacity', 0).style('left', 0).style('top', 0).html(``);
            });
    }
}

function seasonalAvg(data) {
    let monthly = data.map((d) => d.visit);

    let avg = [];

    // Winter
    avg[0] = (monthly[0] + monthly[1]) / 2;

    // Spring
    avg[1] = (monthly[2] + monthly[3] + monthly[4]) / 3;

    // Summer
    avg[2] = (monthly[5] + monthly[6] + monthly[7]) / 3;

    // Fall
    avg[3] = monthly[8] / 2;

    avg = avg.map((d) => Math.round(d));

    let result = [];
    seasons.forEach((d, i) =>
        result.push({
            group: d,
            visit: avg[i],
        }),
    );

    return result;
}
