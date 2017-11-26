import React, { Component } from 'react';
import { bindAll } from 'lodash';
import $ from 'jquery';
import FontAwesome from 'react-fontawesome';
import '../css/font-awesome/css/font-awesome.css';

// Search bar component that manages the query from the input and updates
// the data in the application's main component
export default class SearchBar extends Component {
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
            let visualizationQuery  = baseURL + "?searchTerm=" + searchTerm +"&queryType=search/tweets&resultType=popular&count=10";

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