import React from 'react';
import AppActions from '../actions/AppActions';

var TextInput = React.createClass({
    propTypes: {
        label: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
        keystring: React.PropTypes.string.isRequired,
        labelstyle: React.PropTypes.shape.isRequired, // surely there's a better way
        tooltip: React.PropTypes.string
    },

    updateInput: function(e) {
        AppActions.updateKey(this.props.keystring, e.target.value);
    },

    render: function() {
        let label;
        if(this.props.tooltip) {
            label = (<label style={this.props.labelstyle}
                            data-tooltip={this.props.tooltip}
                            className="chart-title">{this.props.label}</label>)
        } else {
            label = (<label style={this.props.labelstyle}
                            className="chart-title">{this.props.label}</label>)
        }

        return (
        <div style={{display: "inline-block", marginBottom: '10px'}}>
            {label}
            <input onChange={this.updateInput} type="text" value={this.props.value}/>
        </div>);
    }
});

module.exports = TextInput
