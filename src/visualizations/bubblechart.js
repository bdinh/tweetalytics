/***
 * The bubble chart implementation is inspired by Jim Vallandingham
 * http://vallandingham.me/bubble_charts_with_d3v4.html
 * Thanks for creating a great tutorial explaining some of the concepts
 * behind D3 force functions!
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 */

import $ from 'jquery';
import { select, forceSimulation, max, scaleOrdinal,
    forceX, forceY, forceManyBody, keys, event,
    rgb, scalePow } from 'd3';
import { floatingTooltip } from "../js/tooltip";


export default function createBubbleChart(data) {
    // Removes existing bubble chart at the selected container
    select('.bubble-chart').remove();

    // Creates an instance of the bubble chart and loads in the data
    let myBubbleChart  = bubbleChart();

    myBubbleChart(data);

    // Returns a function to create a bubble chart given the data
    function bubbleChart() {

        // Sets appropriate margins
        let margin = {top: 20, right: 0, bottom: 30, left: 0};

        // Creates an instance of our tooltip
        let tooltip = floatingTooltip('bubble_tooltip', 80);

        // Stores the dimensions for our container
        let containerWidth = parseInt(select(".bubble-container").style("width"));
        let containerHeight = parseInt(select(".bubble-container").style("height"));

        // Dimensions for the visualization
        let width = containerWidth - margin.left - margin.right - 40;
        let height = containerHeight - margin.top - margin.bottom - 40;

        // Center coordinate for our visualization to be centered on
        let center = { x: width / 2, y: height / 2 };
        let quarterWidth = width / 4;

        // Center coordinate for the grouping of our bubbles
        let groupCenter = {
            Positive: { x: width / 2 - quarterWidth, y: height / 2 },
            Negative: { x: width / 2 + quarterWidth, y: height / 2 },
        };

        // Coordinate for our labels
        let groupTitleX = {
            Positive: width / 2 - quarterWidth - 20,
            Negative: width / 2 + quarterWidth + 20
        };

        // Force strength utilize for our force function
        let forceStrength = 0.03;


        // Variables that will be utilize throughout the functions
        let svg = null;
        let bubbles = null;
        let nodes = [];


        // Charge function that is called for each node.
        // As part of the ManyBody force.
        // This is what creates the repulsion between nodes.
        //
        // Charge is proportional to the diameter of the
        // circle (which is stored in the radius attribute
        // of the circle's associated data.
        //
        // This is done to allow for accurate collision
        // detection with nodes of different sizes.
        //
        // Charge is negative because we want nodes to repel.
        function charge(d) {
            return -Math.pow(d.radius, 2.0) * forceStrength;
        }

        // Here we create a force layout,
        // create a force simulation now and
        // add forces to it.
        let simulation = forceSimulation()
            .velocityDecay(0.2)
            .force('x', forceX().strength(forceStrength).x(center.x))
            .force('y', forceY().strength(forceStrength).y(center.y))
            .force('charge', forceManyBody().strength(charge))
            .on('tick', ticked);

        simulation.alphaTarget(1).restart();

        simulation.stop();


        let fillColor = scaleOrdinal()
            .domain(['Positive', 'Negative'])
            .range(['#1FADFF', '#FF2A1F']);

        /*
          * This data manipulation function takes the raw data and
          * converts it into an array of node objects.
          * Each node will store data and visualization values to visualize
          * a bubble.
          */
        function createNodes(data) {

            let scaleMax = max(data, (d) => { return +d.value; });
            let bubbleSize = parseInt(containerWidth * 0.05);

            let radiusScale = scalePow()
                .exponent(0.5)
                .range([2, bubbleSize])
                .domain([0, scaleMax]);

            let nodes = data.map((word) => {
                return {
                    id: word.id,
                    tweetID: word.tweetID,
                    text: word.text,
                    radius: radiusScale(+word.value),
                    value: +word.value,
                    name: word.name,
                    group: word.type,
                    x: Math.random() * 900,
                    y: Math.random() * 800
                }
            });

            nodes.sort((node1, node2) => {
                return node2.value - node1.value;
            });

            return nodes;
        }

        /*
         * Main entry point to the bubble chart. This function is returned
         * by the parent closure. It prepares the data for visualization
         * and adds an svg element to the provided selector and starts the
         * visualization creation process.
         */
        let chart = () => {

            nodes = createNodes(data);

            // Creates our container for the visualization
            svg = select(".bubble-container")
                .append("svg")
                .attr("class", "bubble-chart")
                .attr('width', width)
                .attr('height', height);

            bubbles = svg.selectAll('.bubble')
                .data(nodes, (d) => { return d.id; });

            // Bind the svg elements to our array of nodes
            let bubblesEnter = bubbles.enter().append('circle')
                .classed('bubble', true)
                .attr('r', 0)
                .attr('fill', (d) => { return fillColor(d.group); })
                .attr('stroke', (d) => { return rgb(fillColor(d.group)).darker(); })
                .attr('stroke-width', 2)
                .on('mouseover', showTooltip)
                .on('mouseout', hideTooltip);
            bubbles = bubbles.merge(bubblesEnter);

            // Fancy initial transition
            bubbles.transition()
                .duration(2000)
                .attr('r', (d) => { return d.radius; });

            simulation.nodes(nodes);

            groupBubbles();
        };

        /*
         * Callback function that is called after every tick of the
         * force simulation.
         * Here we do the acutal repositioning of the SVG circles
         * based on the current x and y values of their bound node data.
         * These x and y values are modified by the force simulation.
         */
        function ticked() {
            bubbles
                .attr('cx', (d) => { return d.x; })
                .attr('cy', (d) => { return d.y; });
        }


        // Provides a x value for each node to be used with the split by group x force.
        function nodeGroupPosition(d) {
            return groupCenter[d.group].x;
        }


        // Brings the bubbles together
        function groupBubbles() {
            hideGroupTitles();
            simulation.force('x', forceX().strength(forceStrength).x(center.x));

            simulation.alpha(1).restart();
        }

        // Splits the bubbles in their corresponding groups
        function splitBubbles() {

            showGroupTitles();

            simulation.force('x', forceX().strength(forceStrength).x(nodeGroupPosition));

            simulation.alpha(1).restart();
        }

        // Hide the titles of the group when the bubbles need to be split
        function hideGroupTitles() {
            svg.selectAll('.group').remove()
        }

        // Show the titles of the group when the bubbles need to be split
        function showGroupTitles() {
            let groupData = keys(groupTitleX);
            let groups = svg.selectAll(".group")
                .data(groupData);

            groups.enter().append("text")
                .attr("class", "group")
                .attr('x', function (d) { return groupTitleX[d]; })
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .text(function (d) { return d; });
        }

        // Shows the tooltip that embed the tweet and relevent information inside
        function showTooltip(d) {
            tooltip.hideTooltip();

            select(this).attr('stroke', 'black');

            let formattedWord = d.name.charAt(0).toUpperCase() + d.name.slice(1);

            let tooltipContent = '<span class="name">Word: </span><span class="value">' +
                formattedWord  + '</span><br/>' + '<span class="name">Type: </span><span class="value">' + d.group +
                '</span><br/>' + '<span class="name"># of Tweet: </span><span class="value">' + d.value;

            tooltip.showTooltip(tooltipContent, event);

            let queryEmbed = "https://students.washington.edu/bdinh/tweet-react-app/php/query-oembed.php?tweetID=" + d.tweetID;

            fetch(queryEmbed)
                .then((response) => {
                    if (response.ok) {
                        return response.text();
                    }
                })
                .then((data) => {
                    let html = "<p>This Tweet has since been deleted</p>";
                    try {
                        let jsonText = JSON.parse(data);
                        html = jsonText.html;
                    } catch(error) {
                        console.log(error)
                    }
                    console.log(html);
                    $('#bubble_tooltip').append(html);
                })
        }

        // Hides the tooltip
        function hideTooltip(d) {
            select(this).attr('stroke', rgb(fillColor(d.group)).darker());
            // tooltip.hideTooltip();
            select('.bubble-container')
                .on('click', () => {
                    tooltip.hideTooltip();
                })
        }

        // Checks the state of the button and displays the correct version of the bar chart
        chart.toggleDisplay = (displayName) => {
            if (displayName === 'Separated') {
                splitBubbles();
            } else {
                groupBubbles();
            }
        };
        return chart;
    }


    setupButtons();

    // Add event handler to our buttons in order to alter the state of the visualization
    function setupButtons() {
        $('#toolbar')
            .children('.btn')
            .on("click", function () {
                let button = $(this).children('input');
                let buttonValue = button.attr('value');
                myBubbleChart.toggleDisplay(buttonValue);
            })
    }

}