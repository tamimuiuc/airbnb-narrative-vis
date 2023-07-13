// Hide all scenes
d3.selectAll(".scene").style("display", "none");

// Show this scene
d3.select("#scene2").style("display", "block");

d3.csv("https://raw.githubusercontent.com/tamimuiuc/airbnb-narrative-vis/main/data/USA-Airbnb-dataset.csv")
    .then(function(data) {
        // Group the data by state and get the count of listings for each state
        var dataByStateArray = Array.from(d3.group(data, d => d.state), ([key, value]) => ({key, value: value.length}));
        var dataByState = Object.fromEntries(dataByStateArray.map(item => [item.key, item.value]));

        // Load the map of the United States
        d3.json("https://raw.githubusercontent.com/tamimuiuc/airbnb-narrative-vis/main/data/state.json").then(function(us) {
            // Define color scale for map coloring
            var color = d3.scaleLinear()
                .domain([0, d3.max(dataByStateArray, d => d.value)])
                .range(["#e0f7fa", "#0077c2"]);

            // Define a tooltip
            var tooltip = d3.select("#scene2")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "10px")
                .style("font-size", "12px")
                .style("pointer-events", "none");

            // Draw the map
            var svg = d3.select("#scene2-graph") // Changed the target div from scene2 to scene2-graph
                .append("svg")
                .attr("width", 960)
                .attr("height", 600);

            // Add title to the map
            svg.append("text")
                .attr("x", (960 / 2))
                .attr("y", 30)
                .attr("text-anchor", "middle")
                .style('font-size', '22px')
                .style('font-weight', 'bold')
                .style("fill", "#444")
                .text("Geographic distribution of Listings");

            var projection = d3.geoAlbersUsa()
                .scale(1280)
                .translate([480, 300]);

            var path = d3.geoPath().projection(projection);

            svg.append("g")
                .selectAll("path")
                .data(us.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "#ccc")  // Initial color
                .style("stroke", "white")
                .on("mouseover", function(event, d) {  // Add interactivity
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(d.properties.NAME + "<br>" + "Listings: " + (dataByState[d.properties.NAME] || "N/A"))
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .transition()  // Transition effect
                .duration(1000)
                .style("fill", function(d) {
                    // Get the data value for each state
                    var value = dataByState[d.properties.NAME];
                    if (value) {
                        // If value exists…
                        return color(value);
                    } else {
                        // If value is undefined…
                        return "#ccc";
                    }
                });

            // Add a color legend
            var legend = svg.append("g")
                .attr("transform", "translate(20,20)");

            var legendScale = d3.scaleLinear()
                .domain(color.domain())
                .range([0, 200]);

            legend.append("rect")
                .attr("width", 200)
                .attr("height", 20)
                .style("fill", "url(#gradient)");

            var gradient = legend.append("defs")
                .append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%")
                .attr("spreadMethod", "pad");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color.range()[0])
                .attr("stop-opacity", 1);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color.range()[1])
                .attr("stop-opacity", 1);

            legend.call(d3.axisBottom(legendScale));
        });
    })
    .catch(function(error) {
        console.log("Error loading data: " + error);
    });
