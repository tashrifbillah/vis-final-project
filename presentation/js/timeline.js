const buildCarouselItem = d => `
    <div class="carousel-item" style="background-image: url('${d.image}')">
        <div class="carousel-item__content">
            <h2 class="carousel-item__year">${d.year}</h2>
            <h3 class="carousel-item__title">${d.title}</h3>
            <p class="carousel-item__description">${d.description}</p>
        </div>
    </div>
`
const isActive = d => d.title === activeTitle
let activeTitle;

const LAW_IMAGES = [1,2,3,4,5].map(i => `images/law-${i}-min.jpg`)

class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement, data){
        this._parentElement = parentElement;

        // Add in stock photos for laws passed
        this._data = data.map(d => ({ ...d, image: d.image || _.sample(LAW_IMAGES) }));

        // Mark index for year
        const byYear = Object.values(_.groupBy(this._data, 'year'))
        this._displayData = _.flatten(byYear.map(y => y.map((d, i) => ({ ...d, yearIdx: i }))));

        // Calculate the max number of items occurring in a single year
        this.bands = Math.max(...byYear.map(v => v.length))

        this.initVis()
    }

    // create initVis method for Timeline class
    initVis() {

        // store keyword this which refers to the object it belongs to in variable vis
        let vis = this;

        vis.margin = {top: 0, right: 10, bottom: 30, left: 10};

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

        vis.y = d3.scaleBand()
            .range([vis.height, 10])
            .domain(_.times(vis.bands).map(i => i));

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d => d);

        // Append x-axis
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        activeTitle = vis._displayData[0].title

        $('#carousel .carousel-inner').html(vis._displayData.map(buildCarouselItem).join(""))
        $('#carousel .carousel-item:first-child').addClass('active')
        vis.carousel = $('#carousel')
        vis.carousel.carousel('pause')
        $('#carousel').on('slide.bs.carousel', function (evt) {
            activeTitle = $('.carousel-item__title', evt.relatedTarget).text()
            vis.updateVis()
        })

        vis._observer = new IntersectionObserver(function(entries) {
            entries.map((entry) => {
                console.log(entry.isIntersecting)
                if (entry.isIntersecting) {
                    vis.carousel.carousel('cycle')
                } else {
                    vis.carousel.carousel('pause')
                }
            });
        })

        vis._observer.observe(vis.carousel[0])


        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.timelineItems = vis.svg.selectAll("circle.timeline-item").data(vis._displayData, d => d.title)

        vis.timelineItems
            .exit()
            .remove()

        vis.timelineItems
            .enter()
            .append("circle")
            .merge(vis.timelineItems)
            .attr("class", d => _.compact([
                "timeline-item",
                "timeline-item--" + (d.isPark ? "park" : "law"),
                isActive(d) ? "active" : null,
            ]).join(' '))
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d.yearIdx))
            .attr("r", vis.y.bandwidth() / 2)
            .attr("width", 5)
            .on("click", function(_evt, d) {
                const i = vis._displayData.findIndex(({ title }) => title === d.title)
                $("#carousel").carousel(i)
            })
    }
}