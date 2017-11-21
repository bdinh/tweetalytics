import React, { Component } from 'react';
import RadioButton from './radiobutton';
import Title from './title';
import classNames from 'classnames';

export default class VisualizationPanel extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            classes,
            headerTitle,
            subTitle,
            type,
            updateVisualCallback

        } = this.props;

        function createButtons() {
            if (type === "barchart") {
                return (
                    <RadioButton updateVisualCallback={updateVisualCallback} valueArray={["Both", "Retweets", "Favorites"]}/>
                );
            } else {
                return (
                    <div id="toolbar" className="btn-group btn-container" data-toggle="buttons">
                        <label className="btn btn-primary small bubble-options">
                            <input type="radio" name="All" value="All"/> All
                        </label>
                        <label className="btn btn-primary small bubble-options">
                            <input type="radio" name="Separated" value="Separated"/> Separated
                        </label>
                    </div>
                );
            }
        }

        return(
            <div className="col-md-6 panel">
                <div className="card">
                    <div className="card-header">
                        <Title title={headerTitle} section bold/>
                    </div>
                    <div className="visual-controls row">
                        <div className="col-md-6 controls visual-title">
                            <p className="bold extra-ml">{subTitle}</p>
                        </div>
                        <div className="col-md-6 controls">
                            {createButtons()}
                        </div>
                    </div>
                    <div className={classNames("card-body", classes)}>

                    </div>
                </div>
            </div>
        );
    }
}