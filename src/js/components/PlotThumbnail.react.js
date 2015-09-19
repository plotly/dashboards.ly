'use strict';

import React from 'react';
import AppActions from '../actions/AppActions';

var PlotThumbnail = React.createClass({
    propTypes: {
        plot_url: React.PropTypes.string.isRequired,
        plot_name: React.PropTypes.string.isRequired
    },

    getInitialState: function(){
        return {
            hover: false,
            selected: false
        };
    },

    handleChange: function(event) {
        AppActions.addPlotToDashboard(this.props.plot_url);
    },

    mouseOver: function() {
        this.setState({hover: true});
    },

    mouseOut: function() {
        this.setState({hover: false});
    },

    render: function () {
        let imageUrl = this.props.plot_url + '.png';

        let imageStyle = {
            'cursor': 'pointer',
            'background': 'url(' + imageUrl + ')',
            'backgroundPositionX': 'center',
            'backgroundPositionY': 'center',
            'backgroundSize': 'cover',
            'backgroundRepeat': 'no-repeat'
        };
        let overlayStyle = {
            'background': 'rgba(0,0,0,.5)',
            'textAlign': 'center',
            'padding': '45px 0 66px 0',
            'opacity': this.state.hover ? 1 : 0,
            'WebkitTransition': 'opacity .25s ease',
            'MozTransition': 'opacity .25s ease'
        };
        let hoverTextStyle =  {
           'color': 'rgba(255,255,255,.85)',
           'fontSize': '18px',
           'fontWeight': 200
       };

        return (<div className="chart-wrapper">
            <div onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} className="chart-stage">
                <div style={imageStyle} onClick={this.handleChange}>
                    <div style={overlayStyle}>
                        <span style={hoverTextStyle}>add to dashboard</span>
                    </div>
                </div>
            </div>

            <div className="chart-notes">
                {this.props.plot_name}
            </div>
        </div>);

    }
});

module.exports = PlotThumbnail;
