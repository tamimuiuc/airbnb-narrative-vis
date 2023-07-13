// Hide all scenes
d3.selectAll('.scene').style('display', 'none');
// Show this scene
d3.select('#scene4').style('display', 'block');

d3.csv('https://raw.githubusercontent.com/tamimuiuc/airbnb-narrative-vis/main/data/USA-Airbnb-dataset.csv')
  .then(data => {
    // Parsing string values to numeric
    data.forEach(d => {
      d.price = +d.price;
      d.number_of_reviews = +d.number_of_reviews;
    });

    // Define dimensions of the SVG and chart
    const margin = { top: 60, right: 20, bottom: 50, left: 70 };  // Adjusted margin
    const svgWidth = 800,
      svgHeight = 600;
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Create SVG
    let svg = d3
      .select('#scene4-graph')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // Create group for the chart
    let chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    let xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.price)])
      .range([0, chartWidth]);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.number_of_reviews)])
      .range([chartHeight, 0]);

    // Create color scale
    let colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.room_type))
      .range(d3.schemeCategory10);

    // Create axes
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    // Append axes to the chart
    chart
      .append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(xAxis);

    chart.append('g').call(yAxis);

    // Create points for the scatter plot
    chart
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.price))
      .attr('cy', d => yScale(d.number_of_reviews))
      .attr('r', 3)
      .style('fill', d => colorScale(d.room_type))  // Use color scale
      .on('mouseover', function (event, d) {
        // Show tooltip on mouseover
        d3.select(this).attr('r', 6).style('fill', 'red');
        const tooltip = d3.select('#tooltip');
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .style('opacity', 1)
          .html(`<strong>Price:</strong> $${d.price}<br><strong>Reviews:</strong> ${d.number_of_reviews}<br><strong>Room Type:</strong> ${d.room_type}`);
      })
      .on('mouseout', function (d) {
        // Hide tooltip on mouseout
        d3.select(this).attr('r', 3).style('fill', d => colorScale(d.room_type));  // Use color scale
        d3.select('#tooltip').style('opacity', 0);
      });

    // Add color legend
    const legend = svg.append('g')
      .attr('transform', `translate(${svgWidth - margin.right}, ${margin.top})`);

    colorScale.domain().forEach((room_type, i) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(room_type));

      legendRow.append('text')
        .attr('x', -10)
        .attr('y', 10)
        .attr('text-anchor', 'end')
        .style('text-transform', 'capitalize')
        .text(room_type);
    });

    // Add title
    svg
      .append('text')
      .attr('x', svgWidth / 2)
      .attr('y', margin.top / 2)  // Adjusted position
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style("fill", "#444")
      .text('Relationship between Price and Number of Reviews');

    // Add X axis label
    svg
      .append('text')
      .attr('x', svgWidth / 2)
      .attr('y', svgHeight - margin.bottom / 5)  // Adjusted position
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Price');

    // Add Y axis label
    svg
      .append('text')
      .attr('x', -(svgHeight / 2))
      .attr('y', margin.left / 10)  // Adjusted position
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .attr('transform', 'rotate(-90)')
      .text('Number of Reviews');
  })
  .catch(e => {
    console.log('Failed to load data: ' + e);
  });
