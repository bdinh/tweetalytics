/***
 * D3 Barchart inspired by https://bl.ocks.org/mbostock/3885304
 * Although I've worked with D3 quite a lot this summer at my internship,
 * the core foundation of the bar chart resides from Mike Bostock's example.
 */

import { select, scaleBand, scaleLinear, scaleOrdinal,
    max, axisBottom, axisLeft,
    rgb, event } from 'd3';
import $ from 'jquery';
import { floatingTooltip } from "../js/tooltip";

// Creates D3 simple, and grouped bar charts
export default function createBarChart(data, type) {
    // Removes the content of the svg prior to creating a new bar chart
    select('.bar-chart').remove();
    select('#barchart_tooltip').remove();

    // Stores the data locally in order to prevent the need of passing data all the way down to
    // child components
    // let data = this.state.visualizationData;

    let tooltip = floatingTooltip('barchart_tooltip', 80);

    // Sets margin for the chart with respect to the container
    let margin = {top: 20, right: 0, bottom: 30, left: 40};

    // Figure out the container size for the panel in order to create our bar chart with the correct size
    let containerWidth = parseInt(select(".barchart-container").style("width"));
    let containerHeight = parseInt(select(".barchart-container").style("height"));

    // Sets the size for the svg that the bar chart will render in
    let width = containerWidth - margin.left - margin.right - 40;
    let height = containerHeight - margin.top - margin.bottom - 40;

    // Sets the scale for the axis of our bar chart
    let x0 = scaleBand().range([0, width - margin.right]).padding(0.1);
    let y = scaleLinear().range([height, 0]);

    // Sets the domain of our scale
    x0.domain(data.map((d) => {
        return d.user.name;
    }));


    // To adjust the positioning of our bar chart based on the type displayed
    let transformY = type === "Both" ? 10 : 0;

    // Creates our svg canvas that our svg elements will render within
    let svg = select(".barchart-container").append("svg")
        .attr('class', 'bar-chart')
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.bottom + margin.top)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + transformY + ")");

    // Sets our color scale for the type of barchart to get displayed
    let colorScale = scaleOrdinal().domain(["Retweet Count", "Favorite Count"]).range(["#1dcaff", "#c0deed"]);

    // Test the type currently being displayed and re-renders plot accordingly
    if (type === "Both") {

        // Creates the second scale for the grouped bars within our bar chart
        let x1 = scaleBand();

        // Stores the keys of our nested data in order to be able to access it easier
        let keys = Object.keys(data[0].tweet.plotData);

        // Sets up the domain for our scales (x1: scales the grouped data, y: scales the retweet/favorite counts)
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, max(data, (d) => { return max(keys, (key) => { return d.tweet.plotData[key]; }); })]).nice();

        // This is where the major binding of our data and the svg elements are done
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", (d) => { return "translate(" + x0(d.user.name) + ",0)"; })
            .selectAll("rect")
            .data((d) => { return keys.map((key) => {
                return {key: key, value: d.tweet.plotData[key], tweetID: d.tweet.id_str
                }; }); })
            .enter().append("rect")
            .attr("x", (d) => { return x1(d.key); })
            .attr("y", (d) => { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", (d) => { return height - y(d.value); })
            .attr("fill", (d) => { return colorScale(d.key); })
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip)

    } else {
        // Stores a string in order to access our nested mapped data to set our new y domain
        let accessString = "";
        if (type === "Retweets") {
            accessString = "Retweet Count";
            y.domain([0, max(data, (d) => { return d.tweet.plotData[accessString]})]);
        } else if (type === "Favorites") {
            accessString = "Favorite Count";
            y.domain([0, max(data, (d) => { return d.tweet.plotData[accessString]})]);
        }

        // Sets the color based on the type being displayed
        let color = type === "Retweets" ? "#1dcaff" : "#c0deed";

        // Binds the data for a simple bar chart
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar twitter-bar")
            .attr("id", (d) => { return d.tweet.id_str})
            .attr("x", (d) => { return x0(d.user.name)})
            .attr("width", x0.bandwidth())
            .attr("y", (d) => { return y(d.tweet.plotData[accessString])})
            .attr("height", (d) => { return height - y(d.tweet.plotData[accessString])})
            .attr("fill", color)
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);
    }

    // Draws the x axis labels
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(axisBottom(x0))
        .selectAll(".tick text")
        .call(wrap, x0.bandwidth());

    // Draws the y axis labels
    svg.append("g")
        .attr("class", "y-axis")
        .call(axisLeft(y));

    // Function that wraps the x axis labels based on this Mike Bostock's example: https://bl.ocks.org/mbostock/7555321
    function wrap(text, width) {
        text.each(function() {
            let text = select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1,
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    function showTooltip(d) {
        if (type === "Both") {
            select(this).style("fill", rgb(colorScale(d.key)).darker(2));
        } else {
            let color = type === "Retweets" ? "#1dcaff" : "#c0deed";
            select(this).style("fill", rgb(color).darker(2));
        }

        tooltip.showTooltip("", event);

        let tweetID = type === "Both" ? d.tweetID : d.tweet.id_str;
        let queryEmbed = "https://students.washington.edu/bdinh/tweet-react-app/php/query-oembed.php?tweetID=" + tweetID;

        fetch(queryEmbed)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => {
                let html = data.html;
                $('#barchart_tooltip').append(html);
            });

    }

    function hideTooltip(d) {
        if (type === "Both") {
            select(this).style("fill", colorScale(d.key))
        } else {
            let color = type === "Retweets" ? "#1dcaff" : "#c0deed";
            select(this).style("fill", color);
        }
        tooltip.hideTooltip();
    }

}