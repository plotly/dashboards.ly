'use strict'

import React from 'react';
import AppActions from '../actions/AppActions';

var UsernameInput = React.createClass({
    propTypes: {
        username: React.PropTypes.string
    },
    handleChange: function(event) {
        AppActions.updateUsername(event.target.value);
        AppActions.initialize();
    },
    render: function() {
        return (<input
            style={{
                display: 'inline-block',
                width: '120px',
                height: '30px',
                backgroundColor: 'inherit',
                borderBottom: 'thin grey solid',
                lineHeight: '30px',
                paddingBottom: '0px',
                paddingTop: '0px'
            }}
            className="chart-title"
            placeholder={this.props.placeholder}
            type="text" value={this.props.username}
            onChange={this.handleChange}/>)
    }
});

module.exports = UsernameInput;
