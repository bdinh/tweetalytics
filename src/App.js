import React, { Component } from 'react';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js.map';

class App extends Component {
    constructor(props) {
        super(props)

    }

    componentDidMount() {
        // let myInit = {
        //     method: 'GET',
        //     data: {
        //         searchTerm: "Trump",
        //         queryType: "search/tweets"
        //     },
        //     async: false,
        //
        // };

        let baseURL = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php";
        let testURL = "https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php?searchTerm=Trump&queryType=search/tweets";
        let testData = "https://students.washington.edu/bdinh/tweet-react-app/php/query-test-data.php";


        fetch(testData)
            .then( (response) => response.json())
            .then( (data) => {
                console.log(data);
                }
            )

        // $.ajax({
        //     // url: 'https://students.washington.edu/bdinh/tweet-react-app/php/query-tweets.php',
        //     url: 'https://students.washington.edu/bdinh/tweet-react-app/php/query-test-data.php',
        //     type: 'GET',
        //     data: {
        //         // searchTerm: "Trump",
        //         // queryType: "search/tweets"
        //     },
        //     async: false,
        //     success: function (response) {
        //         // console.log(response);
        //
        //         const result = $.parseJSON(response);
        //
        //         console.log(result);
        //     }
        // })


    }

    render() {
        return (
            <div className="App container">
                <SearchBar/>
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
                    <button className="btn search-button" type="button">Search</button></span>
                </div>
            </div>
        );
    }
}

export default App;
