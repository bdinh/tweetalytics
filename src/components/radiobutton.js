import React, { Component } from 'react';

// Group of radio button components created and binned to values of an array
export default class RadioButton extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const {
            data,
            valueArray,
            updateVisualCallback,
        } = this.props;

        return (
            <div className="btn-group btn-container" data-toggle="buttons">
                {valueArray.map((value, i) => {
                    return (<label key={i} className="btn btn-primary small visual-options">
                        <input type="radio" name={value} value={value} onClick={(event) => {
                            updateVisualCallback(data, event.currentTarget.value)
                        }}/> {value}
                    </label>)
                })}

            </div>
        );
    }
}