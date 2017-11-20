import React, { Component } from 'react';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';
import './slick/slick-theme.css';
import './slick/slick.css';
import FontAwesome from 'react-fontawesome';
import './css/font-awesome/css/font-awesome.css';
import { bindAll } from 'lodash';
import { scaleBand, scaleLinear, max, select, selectAll,
    axisBottom, axisLeft, tickValues, scaleOrdinal,
    rgb, schemeCategory20, entries} from 'd3';
import { Tweet } from 'react-twitter-widgets';
import { slick } from 'slick-carousel';
import WordCloud from 'react-d3-cloud';

let sentiment = require("sentiment");


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sentimentData: null,
            visualizationData: null,
            tweetHTML: [],
        };

        bindAll(this, [
            'createBarChart',
            "extractData",
        ])


    }

    sentimentAnalysis() {
        let data = this.state.sentimentData;
        // console.log(data);

        // Retrieves the array of sentiment data returned from the sentiment function
        let sentimentArray = data.map((d) => {
             return sentiment(d)
        });

        console.log(sentimentArray);

        // Combine the positive words into one array
        let postiveWords = sentimentArray.reduce((total, next) => {
            return total.concat(next.positive);
        }, []);

        console.log(postiveWords);

        // Combine the negative words into one array
        let negativeWords = sentimentArray.reduce((total, next) => {
            return total.concat(next.negative);
        }, []);

        console.log(negativeWords);


        let wordCount = {};

        // Get a word count for each word
        postiveWords.map((d) => {
            if (d in wordCount) {
                wordCount[d].value++;
            } else {
                wordCount[d] = {
                    name: d,
                    value: 1,
                    type: "positive"
                };
            }
        });

        negativeWords.map((d) => {
            if (d in wordCount) {
                wordCount[d].value++;
            } else {
                wordCount[d] = {
                    name: d,
                    value: 1,
                    type: "negative"
                };
            }
        });

        let resultData = [];

        Object.keys(wordCount).forEach((word, i) => {
            let insertObj = wordCount[word];
            insertObj.id = i + 1;
            resultData.push(insertObj);
        });

        console.log(wordCount)

        console.log(resultData);


        // let allWords = sentimentArray.reduce((total, next) => {
        //     return total.concat(next.tokens)
        // }, []);
        //
        // console.log(allWords);


        // let allWordCount = {};
        //
        // allWords.map((d) => {
        //     if (d in allWordCount) {
        //         allWordCount[d]++;
        //     } else {
        //         allWordCount[d] = 1;
        //     }
        // });
        //
        // console.log(allWordCount);


        let sentimentScore = sentimentArray.reduce((total, d) => {
            return total + d.score;
        }, 0);

        console.log(sentimentScore);

    }



    createBarChart(type) {

        select("svg").remove();
        let data =this.state.visualizationData;

        let margin = {top: 20, right: 0, bottom: 30, left: 40};

        let containerWidth = parseInt(select(".visualization-container").style("width"));
        let containerHeight = parseInt(select(".visualization-container").style("height"));

        let width = containerWidth - margin.left - margin.right - 40;
        let height = containerHeight - margin.top - margin.bottom - 40;

        let x0 = scaleBand().range([0, width - margin.right]).padding(0.1);
        let y = scaleLinear().range([height, 0]);


        x0.domain(data.map((d) => {
            return d.user.name;
        }));

        let transformY = type === "Both" ? 10 : 0;

        let svg = select(".visualization-container").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.bottom + margin.top)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + transformY + ")");

        let z = scaleOrdinal().range(["#1dcaff", "#c0deed"]);

        if (type === "Both") {
            let x1 = scaleBand();
            let keys = Object.keys(data[0].tweet.plotData);

            x1.domain(keys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, max(data, (d) => { return max(keys, (key) => { return d.tweet.plotData[key]; }); })]).nice();

            svg.append("g")
                .selectAll("g")
                .data(data)
                .enter().append("g")
                .attr("transform", (d) => { return "translate(" + x0(d.user.name) + ",0)"; })
                .selectAll("rect")
                .data((d) => { return keys.map((key) => { return {key: key, value: d.tweet.plotData[key]}; }); })
                .enter().append("rect")
                .attr("x", (d) => { return x1(d.key); })
                .attr("y", (d) => { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", (d) => { return height - y(d.value); })
                .attr("fill", (d) => { return z(d.key); })
                .on("mouseover", function(d) {
                    select(this).style("fill", rgb(z(d.key)).darker(2));
                })
                .on("mouseout", function(d) {
                    select(this).style("fill", z(d.key));
                });

        } else {
            let accessString = "";
            if (type === "Retweets") {
                accessString = "Retweet Count";
                y.domain([0, max(data, (d) => { return d.tweet.plotData[accessString]})]);
            } else if (type === "Favorites") {
                accessString = "Favorite Count";
                y.domain([0, max(data, (d) => { return d.tweet.plotData[accessString]})]);
            }

            let color = type === "Retweets" ? "#1dcaff" : "#c0deed";

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
                .on("mouseover", function() {
                    select(this).style("fill", rgb(color).darker(2));
                })
                .on("mouseout", function() {
                    select(this).style("fill", color);
                });
        }

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(x0))
            .selectAll(".tick text")
            .call(wrap, x0.bandwidth());

        svg.append("g")
            .attr("class", "y-axis")
            .call(axisLeft(y));


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

    }

    componentDidMount() {
        let baseURL = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php";
        let sentimentQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php?searchTerm=Trump&queryType=search/tweets&resultType=mixed&count=100";
        let testSentimentQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-sentiment-data.php";

        fetch(testSentimentQuery)
            .then( (response) => { return response.json() })
            .then( (data) => {
                // console.log(data);
                let parsedTweet = this.extractData(data.statuses, "sentiment");
                this.setState({
                    sentimentData: parsedTweet
                });
            });

        let visualizationQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php?searchTerm=Trump&queryType=search/tweets&resultType=popular&count=10";
        let testVisualizationQuery = "https://students.washington.edu/bdinh/tweet-react-app/php/query-visualization-data.php";

        fetch(testVisualizationQuery)
            .then( (response) => { return response.json() })
            .then( (data) => {
                let parsedTweet = this.extractData(data.statuses, "visualization");
                this.setState({
                    visualizationData: parsedTweet
                });
            });

    }

    extractData(data, type) {

        let result = [];


        if (type === "sentiment") {
            data.forEach((tweet) => {
                result.push(tweet.text);
            });
        } else {
            data.forEach((tweet) => {
                let tweetObj = {
                    user: {
                        id: tweet.id_str,
                        name: tweet.user.name,
                        description: tweet.user.description
                    },
                    tweet: {
                        id_str: tweet.id_str,
                        text: tweet.text,
                        type: tweet.metadata.result_type,
                        url: function () {
                            let url = "Not Available";

                            if (tweet.user.url !== undefined && tweet.user.url !== null) {
                                // console.log("first");
                                url = tweet.user.url;
                            } else if (tweet.entities.urls.length !== 0) {
                                //     console.log("second");
                                if (tweet.entities.urls[0].url !== undefined && tweet.entities.urls[0].url !== null) {
                                    url = tweet.entities.urls[0].url;
                                }
                            } else if (tweet.retweeted_status !== undefined && tweet.retweeted_status !== null) {
                                if (tweet.retweeted_status.entities.urls.length !== 0) {
                                    url = tweet.retweeted_status.entities.urls[0].url;
                                } else {
                                    if (tweet.retweeted_status.extended_entities !== undefined && tweet.retweeted_status.extended_entities !== null) {
                                        if (tweet.retweeted_status.extended_entities.media !== undefined && tweet.retweeted_status.extended_entities.media !== null) {
                                            url = tweet.retweeted_status.extended_entities.media[0].url;
                                        }
                                    }

                                }
                            } else if (tweet.user.entities.url !== undefined && tweet.user.entities.url !== null) {
                                if (tweet.user.entities.url.urls.length !== 0) {
                                    url = tweet.user.entities.url.urls[0].url;
                                }
                            }
                            return url;
                        }(),
                        plotData: {
                            'Retweet Count': tweet.retweet_count,
                            'Favorite Count': tweet.favorite_count
                        }
                    }
                };
                result.push(tweetObj);
            });
        }
        return result;
    }

    render() {
        
        if (this.state.sentimentData !== null && this.state.visualizationData !== null ) {
            this.createBarChart("Both");
            this.sentimentAnalysis();
        }
        // (this.state.data !== null ? this.createBarChart("Favorites") : console.log("not yet"));

        return (

            <div className="App container">
                <Title color={"#0084b4"} title={"Tweetalytics"}/>
                <SearchBar/>
                <div className="row panel-container">
                    <AnalyticPanel headerTitle={"Sentiment Analysis"}/>
                    <VisualizationPanel updateVisualCallback={this.createBarChart} headerTitle={"Visualization"}/>
                    <div className="col-md-12 panel">
                        <div className="card">
                            <div className="card-header">
                                Tweet Carousel
                            </div>
                            <div className="card-body tweet-here">
                                <div className="tweet-carousel" data-slick={{slidesToShow: 2, slidesToScroll: 2}}>
                                    <Tweet tweetId={"930184400037449729"} options={{
                                        align: "center",
                                        width: 250,
                                        cards: "hidden",
                                    }}/>
                                </div>
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
                        <p className="bold">{headerTitle}</p>
                    </div>
                    <div className="card-body">
                        <div id="chart">

                        </div>
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
                        <p className="bold">{headerTitle}</p>
                    </div>
                    <div className="visual-controls row">
                        <div className="col-md-6 controls">
                            <p className="bold">Title</p>
                        </div>
                        <div className="col-md-6 controls">
                            <RadioButton updateVisualCallback={updateVisualCallback} valueArray={["Both", "Retweets", "Favorites"]}/>
                        </div>
                    </div>
                    <div className="card-body visualization-container">

                        {/*<p className="visual-title">Hi</p>*/}
                        {/*<svg className="visualization-canvas" width="auto" height="auto"></svg>*/}
                    </div>
                </div>
            </div>
        );
    }
}

class Title extends Component {
    constructor(props) {
        super(props)
    }

    render() {

    const {
        color,
        title,
    } = this.props;

        return (
            <div className="container">
                <h1 className="title" style={{color: color}}>{title}</h1>
            </div>
        );
    }
}

class SearchBar extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="col-md-6 offset-md-3">
                <div className="search-bar-container">
                    <input type="text" className="form-control search-bar" placeholder="Search for..." aria-label="Search for..."/>
                    <span className="input-group-btn">
                        <button className="btn search-button" type="button">
                            <FontAwesome name={"search"}/>
                        </button>
                    </span>
                </div>
            </div>
        );
    }
}

// class BarChart extends Component {
//     constructor(props) {
//         super(props)
//     }
//
//     render() {
//         const {
//             data,
//         } = this.props;
//
//
//
//
//     }
//
// }

class RadioButton extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            data,
            valueArray,
            updateVisualCallback,
        } = this.props;

        return (
            <div className="btn-group btn-container" data-toggle="buttons">
                {valueArray.map((value, i) => {
                    return (<label key={i} className="btn btn-primary small visual-options">
                        <input type="radio" name={value} value={value} onClick={(event) => {
                            updateVisualCallback(event.currentTarget.value)
                        }}/> {value}
                    </label>)
                })}

            </div>
            );
    }
}


export default App;
