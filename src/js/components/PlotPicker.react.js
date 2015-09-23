'use strict';

import React from 'react';
import AppActions from '../actions/AppActions';
import PlotThumbnail from './PlotThumbnail.react';
import GridThumbnail from './GridThumbnail.react';
import UsernameInput from './UsernameInput.react';

var PlotPicker = React.createClass({
    handleLoadMoreClick: function(event) {
        AppActions.incrementPage();
        AppActions.initialize();
    },

    render: function() {
        let rows = [];
        let row, thumbnail;
        for(var i=0; i<this.props.plots.length; i+=4) {
            row = [];
            for(var j=0; j<4 && i+j < this.props.plots.length; j++) {
                row.push(<div className="three columns">
                    {this.props.plots[i+j].filetype==="plot" ? <PlotThumbnail {...this.props.plots[i+j]}/> : <GridThumbnail {...this.props.plots[i+j]}/>}
                </div>);
            }
            rows.push(<div key={i} className="row">{row}</div>);
        }

        let loadingSpinner=null;
        if(this.props.requestIsPending) {
            loadingSpinner = (<img
                style={{height: '18px', 'marginBottom': '-6px'}}
                src="http://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-small.gif"/>);
        }

        let loadMoreButton;
        if(this.props.requestWasEmpty) {
            loadMoreButton = null;
        } else {
            loadMoreButton = (<div style={{textAlign: 'center', padding: '30px'}}>
                <a id="generate" onClick={this.handleLoadMoreClick} className="button"
                    style={{'cursor': this.props.requestIsPending ? 'default' : 'pointer'}}>
                    {this.props.requestIsPending ? 'loading...' : 'load more'}
                </a>
            </div>);
        }

        return(
            <div className="container">
                <div style={{marginBottom: '10px'}}>
                    <label>plotly username</label>
                    <UsernameInput username={this.props.username}/> {loadingSpinner}
                </div>
                {rows}
                {loadMoreButton}
            </div>);
    }

});

module.exports = PlotPicker;
