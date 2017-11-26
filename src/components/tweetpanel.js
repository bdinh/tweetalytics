import React, { Component } from 'react';
import Title from './title';
import Carousel from './carousel';

// Component that serves as a panel and wraps subsequent components within
export default class TweetPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            carouselData: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.carouselData !== nextProps.carouselData) {
            this.setState({
                carouselData: nextProps.carouselData,
            });
        }
    }

    render() {

        const {
            active,
            headerTitle,
            carouselData,

        } = this.props;

        function displayActive() {
            if (active) {
                return (
                    <div>
                        <div className="card-body tweet-here">
                            <Carousel carouselData={carouselData}/>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className={"no-data-container"}>
                        <p className={"no-data"}>No Data Available</p>
                    </div>
                )
            }
        }

        return (
            <div>
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <Title title={headerTitle} section bold/>
                        </div>
                        {displayActive()}
                    </div>
                </div>
            </div>
        );
    }


}