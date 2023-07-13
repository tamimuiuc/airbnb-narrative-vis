// Hide all scenes
d3.selectAll(".scene").style("display", "none");

// Show this scene
d3.select("#scene3").style("display", "block");

var margin = { top: 70, right: 30, bottom: 60, left: 100 }, // Adjusted margin values
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let svg = d3.select('#scene3-graph')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("https://raw.githubusercontent.com/tamimuiuc/airbnb-narrative-vis/main/data/USA-Airbnb-dataset.csv")
    .then(function (data) {
        // Aggregate data by state and calculate average price
        var data = d3.rollup(data, v => d3.mean(v, d => d.price), d => d.state);
        data = Array.from(data, ([key, value]) => ({ key, value }));

        // Sort data in descending order by average price
        data.sort(function (a, b) { return d3.descending(a.value, b.value); });

        // Select top 10 states
        data = data.slice(0, 13);

        // Define a tooltip
        var tooltip = d3.select("#scene3")
            .append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        // X axis
        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))

        svg.append("text")
            .attr("x", width / 2)
            .attr('y', height + margin.bottom / 1.5) // Adjusted Y position
            .style("text-anchor", "middle")
            .style('font-size', '16px')
            .text("Average Price");

        // Y axis
        var y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.key))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", -(height / 2))
            .attr("y", -margin.left / 1.5) // Adjusted Y position
            .attr("text-anchor", "middle")
            .style('font-size', '16px')
            .attr("transform", "rotate(-90)")
            .text("State");

        // Color scale
        var color = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, d3.max(data, d => d.value)]);

        // Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.key))
            .attr("width", 0)  // Initial width
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d.value))
            .on("mouseover", function(event, d) {  // Add interactivity
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.key + "<br/>" + "Average price: " + d.value.toFixed(2))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()  // Transition effect
            .duration(1000)
            .attr("width", d => x(d.value));

        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 + (margin.top / 40))  // Adjusted title Y position
            .attr("text-anchor", "middle")  
            .style("font-size", "20px")
            .style('font-weight', 'bold') 
            .style("fill", "#444")
            .text("State-wise Average Price of Listings");

    })
    .catch(function(error) {
        console.log("Error loading data: " + error);
    });
