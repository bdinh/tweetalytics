import React, { Component } from 'react';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';
import "../node_modules/slick-carousel/slick/slick.css";
import "../node_modules/slick-carousel/slick/slick-theme.css";

import FontAwesome from 'react-fontawesome';
import './css/font-awesome/css/font-awesome.css';
import { bindAll } from 'lodash';
import { scaleBand, scaleLinear, max, select,
    axisBottom, axisLeft, scaleOrdinal,
    rgb, scalePow, forceSimulation,
    forceX, forceY, forceManyBody, keys, event } from 'd3';
import "./tooltip";
import { Tweet } from 'react-twitter-widgets';
import { floatingTooltip } from "./tooltip";
import './widget';
import Slider from "react-slick";
import Title from './components/title';
import RadioButton from './components/radiobutton';
import { extractResponse } from "./util";


let sentiment = require("sentiment");


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sentimentData: null,
            visualizationData: null,
            tweetHTML: null,
        };

        bindAll(this, [
            'createBarChart',
            'sentimentAnalysis',
            'createBubbleChart',
            'queryTwitter'
        ])
    }

    sentimentAnalysis() {

        let data = this.state.sentimentData;

        // Retrieves the array of sentiment data returned from the sentiment function
        let sentimentArray = data.map((d) => {
             return sentiment(d.text)
        });

        let test = data.map((d) => {
            return {
                text: d.text,
                sentimentObject: sentiment(d.text),
                tweetID: d.tweetID
            }
        });


        // Combine the positive words into one array
        let postiveWords = sentimentArray.reduce((total, next) => {
            return total.concat(next.positive);
        }, []);


        let positiveTest = [];

        test.forEach((tweet) => {
            let tweetID = tweet.tweetID;
            let text = tweet.text;
            tweet.sentimentObject.positive.forEach((word) => {
                positiveTest.push({
                    word: word,
                    tweetID: tweetID,
                    text: text
                });
            });
        });




        let negativeTest = [];

        test.forEach((tweet) => {
            let tweetID = tweet.tweetID;
            let text = tweet.text;
            tweet.sentimentObject.negative.forEach((word) => {
                negativeTest.push({
                    word: word,
                    tweetID: tweetID,
                    text: text
                });
            });
        });

        // Combine the negative words into one array
        let negativeWords = sentimentArray.reduce((total, next) => {
            return total.concat(next.negative);
        }, []);


        let wordCount = {};

        // Get a word count for each word
        positiveTest.map((d) => {
            if (d.word in wordCount) {
                wordCount[d.word].value++;
            } else {
                wordCount[d.word] = {
                    name: d.word,
                    text: d.text,
                    tweetID: d.tweetID,
                    value: 1,
                    type: "Positive"
                };
            }
        });

        negativeTest.map((d) => {
            if (d.word in wordCount) {
                wordCount[d.word].value++;
            } else {
                wordCount[d.word] = {
                    name: d.word,
                    text: d.text,
                    tweetID: d.tweetID,
                    value: 1,
                    type: "Negative"
                };
            }
        });

        let resultData = [];

        Object.keys(wordCount).forEach((word, i) => {
            let insertObj = wordCount[word];
            insertObj.id = i + 1;
            resultData.push(insertObj);
        });

        // Calculates the Sentiment Score
        let sentimentScore = sentimentArray.reduce((total, d) => {
            return total + d.score;
        }, 0);

        let wordArray = [];
        Object.keys(wordCount).forEach((word, i) => {
            let insertObj = wordCount[word];
            wordArray.push(insertObj);
        });

        this.createBubbleChart(resultData);

    }



    createBubbleChart(data) {

        select('.bubble-chart').remove();

        let myBubbleChart  = bubbleChart();

        myBubbleChart('.bubble-container', data);

        function bubbleChart() {

            let margin = {top: 20, right: 0, bottom: 30, left: 0};
            let tooltip = floatingTooltip('bubble_tooltip', 80);

            let containerWidth = parseInt(select(".bubble-container").style("width"));
            let containerHeight = parseInt(select(".bubble-container").style("height"));

            let width = containerWidth - margin.left - margin.right - 40;
            let height = containerHeight - margin.top - margin.bottom - 40;

            let center = { x: width / 2, y: height / 2 };
            let quarterWidth = width / 4;

            let groupCenter = {
                Positive: { x: width / 2 - quarterWidth, y: height / 2 },
                Negative: { x: width / 2 + quarterWidth, y: height / 2 },
            };

            let groupTitleX = {
                Positive: width / 2 - quarterWidth - 20,
                Negative: width / 2 + quarterWidth + 20
            };

            let forceStrength = 0.03;


            let svg = null;
            let bubbles = null;
            let nodes = [];


            function charge(d) {
                return -Math.pow(d.radius, 2.0) * forceStrength;
            }


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

            function createNodes(data) {

                let scaleMax = max(data, (d) => { return +d.value; });

                let radiusScale = scalePow()
                    .exponent(0.5)
                    .range([2, 20])
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

            let chart = () => {

                nodes = createNodes(data);

                svg = select(".bubble-container")
                    .attr("class", "bubble-chart")
                    .append("svg")
                    .attr('width', width)
                    .attr('height', height);

                bubbles = svg.selectAll('.bubble')
                    .data(nodes, (d) => { return d.id; });

                let bubblesEnter = bubbles.enter().append('circle')
                    .classed('bubble', true)
                    .attr('r', 0)
                    .attr('fill', (d) => { return fillColor(d.group); })
                    .attr('stroke', (d) => { return rgb(fillColor(d.group)).darker(); })
                    .attr('stroke-width', 2)
                    .on('mouseover', showTooltip)
                    .on('mouseout', hideTooltip);
                bubbles = bubbles.merge(bubblesEnter);

                bubbles.transition()
                    .duration(2000)
                    .attr('r', (d) => { return d.radius; });


                simulation.nodes(nodes);

                groupBubbles();
            };

            function ticked() {
                bubbles
                    .attr('cx', (d) => { return d.x; })
                    .attr('cy', (d) => { return d.y; });
            }

            function nodeGroupPosition(d) {
                return groupCenter[d.group].x;
            }


            function groupBubbles() {
                hideGroupTitles();
                // @v4 Reset the 'x' force to draw the bubbles to the center.
                simulation.force('x', forceX().strength(forceStrength).x(center.x));

                // @v4 We can reset the alpha value and restart the simulation
                simulation.alpha(1).restart();
            }

            function splitBubbles() {

                showGroupTitles();

                // @v4 Reset the 'x' force to draw the bubbles to their year centers
                simulation.force('x', forceX().strength(forceStrength).x(nodeGroupPosition));

                // @v4 We can reset the alpha value and restart the simulation
                simulation.alpha(1).restart();
            }

            function hideGroupTitles() {
                svg.selectAll('.group').remove()
            }

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

            function showTooltip(d) {
                select(this).attr('stroke', 'black');

                let formattedWord = d.name.charAt(0).toUpperCase() + d.name.slice(1);


                // let html = testingData.tweetHTML[0].html;

                let tooltipContent = '<span class="name">Word: </span><span class="value">' +
                    formattedWord  + '</span><br/>' + '<span class="name">ID: </span><span class="value">' + d.tweetID;

                tooltip.showTooltip(tooltipContent, event);


                let queryEmbed = "https://students.washington.edu/bdinh/tweet-react-app/php/query-oembed.php?tweetID=" + d.tweetID;

                fetch(queryEmbed)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        }
                    })
                    .then((data) => {
                        let html = data.html;
                        console.log(html);
                        $('#bubble_tooltip').append(html);
                    })




                // $('.tooltip').append(htmlString);

            }

            function hideTooltip(d) {
                select(this).attr('stroke', rgb(fillColor(d.group)).darker());
                tooltip.hideTooltip();
            }

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


    createBarChart(type) {

        // Removes the content of the svg prior to creating a new bar chart
        select('.barchart-container').remove();
        select('#barchart_tooltip').remove();

        // Stores the data locally in order to prevent the need of passing data all the way down to
        // child components
        let data = this.state.visualizationData;

        let tooltip = floatingTooltip('barchart_tooltip', 80);

         // Sets margin for the chart with respect to the container
        let margin = {top: 20, right: 0, bottom: 30, left: 40};

        // Figure out the container size for the panel in order to create our bar chart with the correct size
        let containerWidth = parseInt(select(".visualization-container").style("width"));
        let containerHeight = parseInt(select(".visualization-container").style("height"));

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
        let svg = select(".visualization-container").append("svg")
            .attr('class', 'barchart-container')
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
                .on("click", insertTweet);

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

        function insertTweet(d) {
            let carousel = $(".slick-list");

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
                    $('.slick-track').append(html);
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

    componentDidMount() {

        // fetch(testVisualizationQuery)
        //     .then( (response) => { return response.json() })
        //     .then( (data) => {
        //         let parsedTweet = this.extractData(data.statuses, "visualization");
        //         let tweetHTML = [];
        //         parsedTweet.map((tweet) => {
        //             let queryEmbed = "https://students.washington.edu/bdinh/tweet-react-app/php/query-oembed.php?tweetID=" + tweet.tweet.id_str;
        //             fetch(queryEmbed)
        //                 .then((response) => {
        //                     if (response.ok) {
        //                         return response.json();
        //                     }
        //                 })
        //                 .then((data) => {
        //                     let html = data.html;
        //                     tweetHTML.push(html);
        //                 });
        //         });
        //         this.setState({
        //             visualizationData: parsedTweet,
        //             tweetHTML: tweetHTML,
        //         });
        //     });
    }


    queryTwitter(url, type) {
        fetch(url)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => {
                let parsedTweet = extractResponse(data.statuses, type);
                console.log(parsedTweet);
                if (type === 'sentiment') {
                    this.setState({
                        sentimentData: parsedTweet
                    })
                } else {
                    this.setState({
                        visualizationData: parsedTweet
                    })
                }
            })
    }


    render() {
        console.log("render")
        if (this.state.sentimentData !== null && this.state.visualizationData !== null ) {
            this.createBarChart("Both");
            // this.sentimentAnalysis();
            // this.fetch
        }
        return (

            <div className="App container">
                <Title color={"#0084b4"} fontSize={"2em"} title={"Tweetalytics"}/>
                <SearchBar queryCallback={this.queryTwitter}/>
                <div className="row panel-container">
                    <AnalyticPanel headerTitle={"Sentiment Analysis Visualization"}/>
                    <VisualizationPanel updateVisualCallback={this.createBarChart} headerTitle={"Bar Chart Visualization"}/>
                    <div className="col-md-12 panel">
                        <div className="card">
                            <div className="card-header">
                                Tweet Carousel
                            </div>
                            <div className="card-body tweet-here">
                                {/*<TweetCarousel data={this.state.tweetHTML}/>*/}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

class AnalyticPanel extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            headerTitle,
        } = this.props;

        return(
            <div className="col-md-6 panel">
                <div className="card">
                    <div className="card-header">
                        <Title title={headerTitle} section bold/>
                    </div>
                    <div className="visual-controls row">
                        <div className="col-md-6 controls visual-title">
                            <p className="bold extra-ml">Recent 100 Tweets</p>
                        </div>
                        <div className="col-md-6 controls bubble-button">
                            <div id="toolbar" className="btn-group btn-container" data-toggle="buttons">
                                <label className="btn btn-primary small bubble-options">
                                    <input type="radio" name="All" value="All"/> All
                                </label>
                                <label className="btn btn-primary small bubble-options">
                                    <input type="radio" name="Separated" value="Separated"/> Separated
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="card-body bubble-container">

                    </div>
                </div>
            </div>
        );
    }
}


class VisualizationPanel extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            headerTitle,
            updateVisualCallback,
        } = this.props;

        return(
            <div className="col-md-6 panel">
                <div className="card">
                    <div className="card-header">
                        <Title title={headerTitle} section bold/>
                    </div>
                    <div className="visual-controls row">
                        <div className="col-md-6 controls">
                            <p className="bold">Top 10 Tweets</p>
                        </div>
                        <div className="col-md-6 controls">
                            <RadioButton updateVisualCallback={updateVisualCallback} valueArray={["Both", "Retweets", "Favorites"]}/>
                        </div>
                    </div>
                    <div className="card-body visualization-container">

                    </div>
                </div>
            </div>
        );
    }
}


class SearchBar extends Component {
    constructor(props) {
        super(props);
        bindAll(this, [
            'createQuery'
        ])
    }

    createQuery(event) {
        let input = $('.search-bar');
        let searchTerm = input.val();
        if (searchTerm.length !== 0) {
            // Example query: "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php?searchTerm=Trump&queryType=search/tweets&resultType=mixed&count=100"
            let baseURL = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php";
            let sentimentQuery = baseURL + "?searchTerm=" + searchTerm + "&queryType=search/tweets&resultType=mixed&count=100";
            let visualizationQuery = baseURL + "?searchTerm=" + searchTerm +"&queryType=search/tweets&resultType=popular&count=10";

            // Testing queries to my proxies that doesn't request data from twitter
            let testSentimentQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-sentiment-data.php";
            let testVisualizationQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-visualization-data.php";


            this.props.queryCallback(testSentimentQuery, 'sentiment');
            this.props.queryCallback(testVisualizationQuery, 'visualization');
        }
    }

    buttonHandling() {
        let input = $('.search-bar');
        let searchTerm = input.val();
        let searchButton = $('.search-button');
        if (searchTerm.length === 0) {
            searchButton.prop('disabled', true);
        } else {
            searchButton.prop('disabled', false);
        }
    }

    render() {

        return (
            <div className="col-md-6 offset-md-3">
                <div className="search-bar-container">
                    <input onChange={this.buttonHandling} type="text" className="form-control search-bar" placeholder="Search for..." aria-label="Search for..."/>
                    <span className="input-group-btn">
                        <button className="btn search-button" type="button" onClick={this.createQuery}>
                            <FontAwesome name={"search"}/>
                        </button>
                    </span>
                </div>
            </div>
        );
    }
}


class TweetCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselData: this.props.tweetHTML,
        }
    }

    componentDidMount() {
        // console.log(this.state);


    }

    componentWillReceiveProps(nextProps) {

        if (this.props.data !== nextProps.data) {


            // console.log(nextProps);
            this.setState({
                carouselData: nextProps.data,
            });

            // tweetHTML.forEach((tweet) => {
            //     $('.slick-list').append(tweet);
            // });
        }
    }

    render() {

            if (this.state.carouselData !== undefined) {
                let settings = {
                    accessibility: true,
                    dots: true,
                    draggable: true,
                    swipe: true,
                    infinite: true,
                    speed: 500,
                    slidesToShow: 1,
                    slidesToScroll: 1
                };

                // console.log(this.state.carouselData);
                // console.log(this.props.data)

                let test = [1,2,3,4,5];

                return(
                    <div>
                        {this.state.carouselData.map((tweet, i) => {
                            return (<div key={i}>
                                {tweet}
                            </div>)
                        })}
                    </div>
                );
            } else {
                return <h1>Loading...</h1>
            }
    }
}

export default App;
