
import React, { Component } from 'react';

// Component that renders a title given certain style props
export default class Title extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            color,
            title,
            fontSize,
            bold,
            section,
        } = this.props;

        let styleObject = {
            color: color ? color : "black",
            fontSize: fontSize ? fontSize : "1em",
            fontWeight: bold ? "bold" : "normal"
        };

        let classNames = section ? "remove-btm" : "title";

        return (
            <div className="container">
                <p className={classNames} style={styleObject}>{title}</p>
            </div>
        );
    }
}