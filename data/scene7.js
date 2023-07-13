// Load data
d3.csv('https://tamimuiuc.github.io/airbnb-narrative-vis/data/USA-Airbnb-dataset.csv')
  .then((data) => {
    // Parse price as a number
    data.forEach(d => d.price = +d.price);

    // Get list of states
    let states = [...new Set(data.map(d => d.state))];

    // Start at the first state
    let currentStateIndex = 0;

    // Set the dimensions and margins of the graph
    var margin = {top: 50, right: 30, bottom: 60, left: 60},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // Create a container for the title and the buttons
    var container = d3.select("#scene7-graph")
        .append("div")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("margin-bottom", "20px"); // Add some margin to separate it from the chart

    // Create button container
    var buttonContainer = container.append("div");

    // Create buttons inside the button container
    buttonContainer.append('button')
        .attr("id", "previous")
        .text('Previous State')

    buttonContainer.append('button')
        .attr("id", "next")
        .text('Next State')

    // Create the title inside the container
    container.append('h2')
        .attr("id", "title")
        .style("text-align", "center")
        .style("flex-grow", "1")
        .style("margin-right", "00px"); // Push the title to the left

    // Append the svg object to the body of the page
    var svg = d3.select("#scene7-graph")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Create a tooltip
    var tooltip = d3.select("#scene7-graph")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    // X axis: scale and draw
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.price)])
        .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d => d > 0 ? d : ""));

    // X axis label
    svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom / 1.5) + ")")
      .style("text-anchor", "middle")
      .text("Price");

    // Y axis: initialization
    var y = d3.scaleLinear()
      .range([height, 0]);
    var yAxis = svg.append("g")

    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left / 1.1)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Count");

    function updateScene() {
      // Filter data for the current state
      let state = states[currentStateIndex];

      // Update buttons
      d3.select("#previous")
        .on('click', () => {
          currentStateIndex = Math.max(0, currentStateIndex - 1);
          updateScene();
        });

      d3.select("#next")
        .on('click', () => {
          currentStateIndex = Math.min(states.length - 1, currentStateIndex + 1);
          updateScene();
        });

      // Update the state name as a title
      d3.select("#title").text(`Price Distribution in ${state}`);

      // Update the histogram
      var histogram = d3.histogram()
          .value(d => d.price)
          .domain(x.domain())
          .thresholds(x.ticks(70));

      // And apply this function to data to get the bins
      var bins = histogram(data.filter(d => d.state === state));

      // Y axis: update now that we know the domain
      y.domain([0, d3.max(bins, d => d.length)]);
      yAxis
          .transition()
          .duration(1000)
          .call(d3.axisLeft(y));

      // Join the rect with the bins data
      var u = svg.selectAll("rect")
          .data(bins);

      // Manage the existing bars and eventually the new ones
      u
          .enter()
          .append("rect") // Add a new rect for each new elements
          .merge(u) // get the already existing elements as well
          .on("mouseover", function(event, d) { // Add interactivity
              tooltip.style("visibility", "visible");
              tooltip.html("Price range: $" + d.x0.toFixed(2) + " - $" + d.x1.toFixed(2) + "<br>" + "Count: " + d.length);
              tooltip.style("left", (event.pageX) + "px");
              tooltip.style("top", (event.pageY - 30) + "px");
          })
          .on("mouseout", function() {
              tooltip.style("visibility", "hidden");
          })
          .transition() // and apply changes to all of them
          .duration(1000)
            .attr("x", 1)
            .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
            .attr("width", d => x(d.x1) - x(d.x0))
            .attr("height", d => height - y(d.length))
            .style("fill", "#69b3a2");

      // If less bar in the new histogram, I delete the ones not in use anymore
      u
          .exit()
          .remove();
    }

    // Initialize the scene
    updateScene();
  })
  .catch((error) => console.error('Error:', error));
