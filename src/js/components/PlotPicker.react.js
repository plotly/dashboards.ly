'use strict';

import React from 'react';
import AppActions from '../actions/AppActions';
import PlotThumbnail from './PlotThumbnail.react';
import UsernameInput from './UsernameInput.react';

var PlotPicker = React.createClass({
    handleLoadMoreClick: function(event) {
        AppActions.incrementPage();
        AppActions.initialize();
    },

    render: function() {

        let rows = [];
        for(var i=0; i<this.props.plots.length; i+=4) {
            rows.push(
                <div key={i} className="row">
                    <div className="three columns">
                        <PlotThumbnail {...this.props.plots[i]}/>
                    </div>
                    <div className="three columns">
                        <PlotThumbnail {...this.props.plots[i+1]}/>
                    </div>
                    <div className="three columns">
                        <PlotThumbnail {...this.props.plots[i+2]}/>
                    </div>
                    <div className="three columns">
                        <PlotThumbnail {...this.props.plots[i+3]}/>
                    </div>
                </div>)
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
            <div>
                <div style={{marginBottom: '10px'}}>
                    <label style={{
                        display: 'inline-block',
                        height: '30px',
                        marginBottom: '0px',
                        marginRight: '10px'
                    }}>plotly username</label>
                    <UsernameInput username={this.props.username}/> {loadingSpinner}
                </div>
                {rows}
                {loadMoreButton}
            </div>);
    }

});

module.exports = PlotPicker;
