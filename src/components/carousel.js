import React, { Component } from 'react';
// import "../../node_modules/slick-carousel/slick/slick.css";
// import "../../node_modules/slick-carousel/slick/slick-theme.css";

import { Carousel } from 'react-responsive-carousel';
import '../../node_modules/react-responsive-carousel/lib/styles/carousel.min.css';
let HtmlToReactParser = require('html-to-react').Parser;


export default class TweetCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselData: [],
        }
    }



    componentWillReceiveProps(nextProps) {
        console.log(this.props.carouselData);
        console.log(nextProps.carouselData);

        if (this.props.carouselData !== nextProps.carouselData) {

            console.log(nextProps);
            this.setState({
                carouselData: nextProps.carouselData,
            });
        }
    }


    render() {

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

        const {
            carouselData,
        } = this.props;

        // console.log(this.props.carouselData);

        return (
          <div>
            <Carousel>
                {this.props.carouselData.map((tweet, i) => {
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