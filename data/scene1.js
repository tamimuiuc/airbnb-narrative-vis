// Scene 1: Introduction
let introDiv = d3.select("#intro");

// By adding transitions, you can improve the user experience with smoother visuals
// Also, setting the duration of transitions will make sure all transitions are uniform across all scenes
const transitionDuration = 500;

// Use the transition on entering elements
introDiv.transition()
    .duration(transitionDuration)
    .style("opacity", 1);

introDiv.append("h1")
    .text("Airbnb Listing Analysis and Trends");

introDiv.append("p")
    .text("Welcome to our Airbnb data analysis. In this interactive exploration, you'll learn about Airbnb listings in the United States and uncover interesting patterns and insights. Use the navigation buttons placed on top of the page to move between different scenes.");

// Add an annotation
introDiv.append("p")
    .style("font-weight", "bold")
    .text("Key Point: This project uses Airbnb data to provide insights into the Airbnb market in the United States.");

// Add a "Next" button
let nextButton = introDiv.append("button")
    .text("Next")
    .on("click", function() {
        // Transition out before hiding
        introDiv.transition()
            .duration(transitionDuration)
            .style("opacity", 0)
            .on("end", function() {
                // Hide the introduction scene
                introDiv.style("display", "none");
                // Show the next scene (you'll need to define the showScene function in your code)
                showScene('scene2');
            });
    });

// Adding keyboard accessibility for better user experience
d3.select(window).on('keydown', function() {
    // Listen for the "right arrow" key press (key code 39)
    if (d3.event.keyCode === 39) {
        nextButton.dispatch('click');
    }
});
