import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';


import createBarChart from './visualizations/barcharts';
import { bindAll } from 'lodash';
import { scaleBand, scaleLinear, max, select,
    axisBottom, axisLeft, scaleOrdinal,
    rgb, scalePow, forceSimulation,
    forceX, forceY, forceManyBody, keys, event } from 'd3';
import "./js/tooltip";
import { Tweet } from 'react-twitter-widgets';
import Title from './components/title';
import VisualizationPanel from './components/visualizationpanel';
import SearchBar from './components/searchbar';
import TweetPanel from './components/tweetpanel';
import { extractResponse, sentimentAnalysis } from "./js/util";


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
            'queryTwitter'
        ])
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
                    sentimentAnalysis(this.state.sentimentData);
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
