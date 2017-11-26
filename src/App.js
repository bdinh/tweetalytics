import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';


import createBarChart from './visualizations/barcharts';
import createBubbleChart from './visualizations/bubblechart';
import { bindAll } from 'lodash';
import { scaleBand, scaleLinear, max, select,
    axisBottom, axisLeft, scaleOrdinal,
    rgb, scalePow, forceSimulation,
    forceX, forceY, forceManyBody, keys, event } from 'd3';
import "./tooltip";
import { Tweet } from 'react-twitter-widgets';
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
            'sentimentAnalysis',
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

        createBubbleChart(resultData);

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
                    createBarChart(this.state.visualizationData, "Both");
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
                        updateVisualCallback={createBarChart}
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
