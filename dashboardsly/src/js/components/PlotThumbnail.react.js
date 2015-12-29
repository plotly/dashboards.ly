'use strict';

import React from 'react';
import AppActions from '../actions/AppActions';

var PlotThumbnail = React.createClass({
    propTypes: {
        url: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired
    },

    getInitialState: function(){
        return {
            hover: false,
            selected: false
        };
    },

    handleChange: function(event) {
        AppActions.addPlotToDashboard({'plot_url': this.props.url});
    },

    mouseOver: function() {
        this.setState({hover: true});
    },

    mouseOut: function() {
        this.setState({hover: false});
    },

    render: function () {
        let sharekey;
        let plot_url = this.props.url;
        if(plot_url.indexOf('share_key') > -1){
            sharekey = plot_url.slice(plot_url.indexOf('?share_key=')+'?share_key='.length, plot_url.length);
            plot_url = plot_url.replace('?share_key='+sharekey, '');
        }
        let imageUrl = plot_url + '.png' + (sharekey ? '?share_key='+sharekey : '');
        let imageStyle = {
            'cursor': 'pointer',
            'background': 'url(' + imageUrl + ')',
            'backgroundPositionX': 'center',
            'backgroundPositionY': 'center',
            'backgroundSize': 'cover',
            'backgroundRepeat': 'no-repeat'
        };

        let overlayStyle = {'opacity': this.state.hover ? 1 : 0};

        return (<div className="chart-wrapper">
            <div onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} className="chart-stage">
                <div style={imageStyle} onClick={this.handleChange}>
                    <div className="overlay" style={overlayStyle}>
                        <span className="overlay-text">add to dashboard</span>
                    </div>
                </div>
            </div>

            <div className="chart-notes">
                {this.props.name}
            </div>
        </div>);

    }
});

module.exports = PlotThumbnail;
