// Hide all scenes
d3.selectAll('.scene').style('display', 'none');

// Show this scene
d3.select('#scene6').style('display', 'block');

d3.csv('https://tamimuiuc.github.io/airbnb-narrative-vis/data/USA-Airbnb-dataset.csv')
    .then(data => {
        // Parsing string values to numeric and dates
        data = data.filter(d => {
            d.price = +d.price;
            d.number_of_reviews = +d.number_of_reviews;
            d.last_review = new Date(d.last_review);
            // Validate data
            return (
                !isNaN(d.price) &&
                !isNaN(d.number_of_reviews) &&
                d.last_review instanceof Date &&
                !isNaN(d.last_review.getTime())
            );
        });

        // Group data by year and calculate total listings and hosts for each year
        const performanceByYear = d3.rollups(
            data,
            v => ({
                listings: v.length,
                hosts: d3.rollups(v, n => n.length, d => d.host_id).length,
            }),
            d => d.last_review.getFullYear()
        );

        // Sort the data by year
        performanceByYear.sort((a, b) => d3.ascending(a[0], b[0]));

        // Extract the listings and hosts values
        const years = performanceByYear.map(d => d[0]);
        const listingsData = performanceByYear.map(d => d[1].listings);
        const hostsData = performanceByYear.map(d => d[1].hosts);

        // Define dimensions of the SVG and chart
        const margin = { top: 50, right: 20, bottom: 60, left: 70 };
        const svgWidth = 800,
            svgHeight = 600;
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        // Create SVG
        let svg = d3.select('#scene6-graph')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        // Create group for the chart
        let chart = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Create scales
        let xScale = d3.scaleBand()
            .domain(years)
            .range([0, chartWidth])
            .padding(0.2);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max([d3.max(listingsData), d3.max(hostsData)])])
            .range([chartHeight, 0]);

        // Create x-axis
        let xAxis = d3.axisBottom(xScale)
            .tickValues(years);

        // Create y-axis
        let yAxis = d3.axisLeft(yScale);

        // Append axes to the chart
        chart.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis)
            .append('text')
                .attr('x', chartWidth / 2)
                .attr('y', 40)
                .attr('fill', 'black')
                .style("text-anchor", "middle")
                .style('font-size', '16px')
                .text('Year');

        chart.append('g')
            .call(yAxis)
            .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -50)
                .attr('x', -(chartHeight / 2))
                .attr('fill', 'black')
                .style("text-anchor", "middle")
                .style('font-size', '16px')
                .text('Count');
        // Create bars for the chart with transition
        let barWidth = xScale.bandwidth() / 2;

        // Create a Tooltip
        const tooltip = d3.select('#scene6')
            .append('div')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'white')
            .style('border', '1px solid #333')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .text('Tooltip');

        // Listings bars
        chart.selectAll('.bar-listings')
            .data(years)
            .enter()
            .append('rect')
            .attr('class', 'bar-listings')
            .attr('x', (d) => xScale(d) + barWidth)
            .attr('y', (d) => yScale(listingsData[years.indexOf(d)]))
            .attr('width', barWidth)
            .attr('height', (d) => chartHeight - yScale(listingsData[years.indexOf(d)]))
            .style('fill', 'orange')
            .on('mouseover', function (event, d) {
                let i = years.indexOf(d);
                tooltip.style('visibility', 'visible')
                    .text(`Year: ${d} - Listings: ${listingsData[i]}`);
            })
            .on('mousemove', function (event) {
                tooltip.style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('visibility', 'hidden');
            });

        // Hosts bars
        chart.selectAll('.bar-hosts')
            .data(years)
            .enter()
            .append('rect')
            .attr('class', 'bar-hosts')
            .attr('x', (d) => xScale(d))
            .attr('y', (d) => yScale(hostsData[years.indexOf(d)]))
            .attr('width', barWidth)
            .attr('height', (d) => chartHeight - yScale(hostsData[years.indexOf(d)]))
            .style('fill', 'green')
            .on('mouseover', function (event, d) {
                let i = years.indexOf(d);
                tooltip.style('visibility', 'visible')
                    .text(`Year: ${d} - Hosts: ${hostsData[i]}`);
            })
            .on('mousemove', function (event) {
                tooltip.style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('visibility', 'hidden');
            });

        // Add legend
        const legend = chart.append('g')
            .attr('transform', `translate(${chartWidth - 120}, 0)`);

        // Listings legend
        legend.append('rect')
            .attr('x', 0)
            .attr('y', -8)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', 'orange');

        legend.append('text')
            .attr('x', 15)
            .attr('y', 0)
            .attr('alignment-baseline', 'middle')
            .text('Listings');

        // Hosts legend
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 13)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', 'green');

        legend.append('text')
            .attr('x', 15)
            .attr('y', 20)
            .attr('alignment-baseline', 'middle')
            .text('Hosts');

        // Add title
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', margin.top)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .style("fill", "#444")
            .text('Yearly Airbnb Listings and Hosts')
    });
