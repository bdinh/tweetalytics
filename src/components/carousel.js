import React, { Component } from 'react';

import { Carousel } from 'react-responsive-carousel';
import '../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css';
let HtmlToReactParser = require('html-to-react').Parser;

// With the passed in html string of embed tweets from Twitter, create a carousel
// showing the tweets
export default class TweetCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselData: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.carouselData !== nextProps.carouselData) {

            console.log(nextProps);
            this.setState({
                carouselData: nextProps.carouselData,
            });
        }
    }

    render() {

        const {
            carouselData,
        } = this.props;

        return (
          <div>
            <Carousel>
                {carouselData.map((tweet, i) => {
                    let htmlToReactParser = new HtmlToReactParser();
                    let reactElement = htmlToReactParser.parse(tweet);
                    return (
                        <div key={i}>
                            {reactElement}
                        </div>
                    )
                })}
            </Carousel>
          </div>
        );
    }


}