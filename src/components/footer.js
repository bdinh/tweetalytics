import React, { Component } from 'react';

export default class Footer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <footer>
            <div className="container footer">
                <p>Data from <a href="https://developer.twitter.com/en/docs/tweets/search/overview">Twitter Rest API</a></p>
                <p className="footer-text">Made with &hearts; by Bao Dinh</p>
            </div>
        </footer>
        );
    }
}