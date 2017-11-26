import React, { Component } from 'react';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';


import createBarChart2 from './visualizations/barcharts';
import { bindAll } from 'lodash';
import { scaleBand, scaleLinear, max, select,
    axisBottom, axisLeft, scaleOrdinal,
    rgb, scalePow, forceSimulation,
    forceX, forceY, forceManyBody, keys, event } from 'd3';
import "./tooltip";
import { Tweet } from 'react-twitter-widgets';
import { floatingTooltip } from "./tooltip";
import Title from './components/title';
import VisualizationPanel from './components/visualizationpanel';
import SearchBar from './components/searchbar';
import TweetPanel from './components/tweetpanel';
import { extractResponse } from "./util";
let sentiment = require("sentiment");


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sentimentData: null,
            visualizationData: null,
            tweetHTML: null,
            bubbleActive: false,
            barchartActive: false,
            carouselActive: false,
        };

        bindAll(this, [
            // 'createBarChart',
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
                    .append("svg")
                    .attr("class", "bubble-chart")
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


    componentDidMount() {

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
                if (type === 'sentiment') {
                    this.setState({
                        sentimentData: parsedTweet,
                        bubbleActive: true
                    });
                    this.sentimentAnalysis();
                } else {

                    let tweetHTML = [];
                    parsedTweet.map((tweet) => {
                        let embedQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-oembed.php?tweetID=" + tweet.tweet.id_str;
                        fetch(embedQuery)
                            .then((response) => {
                                if (response.ok) {
                                    return response.text();
                                }
                            })
                            .then((data) => {
                                try {
                                    let jsonText = JSON.parse(data);
                                    let html = jsonText.html;
                                    let formattedHTML = html.replace("class", "className");
                                    tweetHTML.push(formattedHTML);
                                    this.setState({
                                        tweetHTML: tweetHTML,
                                        carouselActive: true,
                                    });
                                } catch(error) {
                                    console.log(error)
                                }
                            });

                    });
                    this.setState({
                        visualizationData: parsedTweet,
                        tweetHTML: tweetHTML,
                        barchartActive: true,
                        carouselActive: true,
                    });
                    createBarChart2(this.state.visualizationData, "Both");
                    // this.createBarChart("Both");
                }
            })
    }

    render() {

        return (

            <div className="App container">
                <Title color={"#0084b4"} fontSize={"2em"} title={"Tweetalytics"}/>
                <SearchBar queryCallback={this.queryTwitter}/>
                <div className="row panel-container">
                    <VisualizationPanel
                        active={this.state.bubbleActive}
                        headerTitle={"Sentiment Analysis Visualization"}
                        subTitle={"Recent 100 Tweets"}
                        type={"bubblechart"}
                    />
                    <VisualizationPanel
                        active={this.state.barchartActive}
                        data={this.state.visualizationData}
                        headerTitle={"Bar Chart Visualization"}
                        subTitle={"Top 10 Tweets"}
                        type={"barchart"}
                        updateVisualCallback={createBarChart2}
                    />
                </div>
                <TweetPanel
                    active={this.state.carouselActive}
                    headerTitle={"Top 10 Tweets"}
                    carouselData={this.state.tweetHTML}
                />
            </div>
        );
    }
}
export default App;
