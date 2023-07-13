// Hide all scenes
d3.selectAll('.scene').style('display', 'none');

// Show this scene
d3.select('#scene5').style('display', 'block');

d3.csv('https://tamimuiuc.github.io/airbnb-narrative-vis/data/USA-Airbnb-dataset.csv')
    .then(data => {
        // Group data by room type and count the number of listings for each type
        const roomTypeCounts = Array.from(d3.group(data, d => d.room_type), ([key, value]) => ({
            key,
            value: value.length,
        }));

        // Define room type order
        const roomTypeOrder = ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'];

        // Sort the room types according to the specified order
        roomTypeCounts.sort((a, b) => roomTypeOrder.indexOf(a.key) - roomTypeOrder.indexOf(b.key));

        // Define dimensions of the SVG and chart
        const margin = { top: 60, right: 20, bottom: 50, left: 70 };
        const svgWidth = 800;
        const svgHeight = 600;
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        // Create SVG
        let svg = d3.select('#scene5-graph')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        // Create group for the chart
        let chart = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Create scales
        let xScale = d3.scaleBand()
            .domain(roomTypeCounts.map(d => d.key))
            .range([0, chartWidth])
            .padding(0.5);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(roomTypeCounts, d => d.value)])
            .range([chartHeight, 0]);

        // Create color scale
        let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(roomTypeOrder);

        // Create the legend
        let legend = svg.selectAll(".legend")
            .data(colorScale.domain())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        // Draw legend colored rectangles
        legend.append("rect")
            .attr("x", chartWidth + margin.left)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", colorScale);

        // Draw legend text
        legend.append("text")
            .attr("x", chartWidth + margin.left - 10)
            .attr("y", 5)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d;
            });

        // Create axes
        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);

        // Append axes to the chart
        chart.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis);

        chart.append('g')
            .call(yAxis);

        // Create bars for the chart
        let bars = chart.selectAll('rect')
            .data(roomTypeCounts)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.key))
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => chartHeight - yScale(d.value))
            .style('fill', d => colorScale(d.key));

        // Add title
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style("fill", "#444")
            .text('Breakdown of Listings by Room Type');

        // Add X axis label
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', svgHeight - margin.bottom / 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text('Room Type');

        // Add Y axis label
        svg.append('text')
            .attr('x', -(svgHeight / 2))
            .attr('y', margin.left / 10)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .attr('transform', 'rotate(-90)')
            .text('Number of Listings');
    })
    .catch(e => {
        console.log('Failed to load data: ' + e);
    });
