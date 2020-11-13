const buildCarouselItem = d => `
    <div class="carousel-item">
        <h2>${d.year}</h2>
        <h3>${d.title}</h3>
        <p>${d.body}</p>
    </div>
`

class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement, data){
        this._parentElement = parentElement;
        this._data = data;

        this._displayData = data;

        this.initVis()
    }

    // create initVis method for Timeline class
    initVis() {

        // store keyword this which refers to the object it belongs to in variable vis
        let vis = this;

        vis.margin = {top: 0, right: 40, bottom: 30, left: 40};

        vis.width = $('#' + vis._parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis._parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis._parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(vis._displayData, function(d) { return d.year; }));

        // vis.y = d3.scaleLinear()
        //     .range([vis.height, 0])
        //     .domain([0, d3.max(vis._displayData, function(d) { return d.Expenditures; })]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        // Draw area by using the path generator
        vis.svg.selectAll("rect.timeline-item")
            .data(vis._displayData)
            .enter()
            .append("rect")
            .attr("class", "timeline-item")
            .attr("x", d => vis.x(d.year))
            .attr("y", vis.height / 2)
            .attr("height", vis.height / 2)
            .attr("width", 5)

        // Append x-axis
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);
    }
}

d3.json("data/timeline_data.json").then(data => {
    new Timeline("timeline", data)
})
