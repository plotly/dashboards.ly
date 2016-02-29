'use strict';

import React from 'react';
import AppActions from '../actions/AppActions';
import PlotThumbnail from './PlotThumbnail.react';
import GridThumbnail from './GridThumbnail.react';
import TextInput from './TextInput.react';

var PlotPicker = React.createClass({
    handleLoadMoreClick: function(event) {
        AppActions.incrementPage();
        AppActions.initialize();
    },

    render: function() {
        let rows = [];
        let row, thumbnail, j;
        for(var i=0; i<this.props.plots.length; i+=4) {
            row = [];
            for(j=0; j<4 && i+j < this.props.plots.length; j++) {
                row.push(<div key={i+j} className="three columns">
                    {this.props.plots[i+j].filetype==="plot" ? <PlotThumbnail {...this.props.plots[i+j]}/> : <GridThumbnail {...this.props.plots[i+j]}/>}
                </div>);
            }
            rows.push(<div key={i+j} className="row">{row}</div>);
        }

        let loadingSpinner=null;
        if(this.props.requestIsPending) {
            loadingSpinner = (<img
                style={{height: '18px', 'marginBottom': '-6px'}}
                src="static/images/loader-small.gif"/>);
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

        let auth;
        if(this.props.requestIsPending) {
            auth = null;
        } else if(this.props.isAuth===true) {
            auth = (
                <span>
                    <span style={{color: '#2ECC40', verticalAlign: 'middle', fontSize: '16px', paddingLeft: '5px', paddingRight: '5px'}}>&#10003;</span>
                    <span style={{fontSize: '10px', lineHeight: '16px'}}>(authenticated) <a href={CONFIG.PLOTLY_DOMAIN+"/settings/api/"} target="_blank">Get your API key</a></span>
                </span>)
        } else if(this.props.isAuth===false) {
            auth = (
                <span>
                    <span style={{color: '#FF4136', verticalAlign: 'middle', fontSize: '16px', paddingLeft: '5px', paddingRight: '5px'}}>&times;</span>
                    <span style={{fontSize: '10px', lineHeight: '16px'}}>(not authenticated) <a href={CONFIG.PLOTLY_DOMAIN+"/settings/api/"} target="_blank">Get your API key</a></span>
                </span>)
        }

        return(
            <div className="container">
                <div style={{marginBottom: '10px'}}>
                    <TextInput labelstyle={{textTransform: 'uppercase', fontWeight: 400, letterSpacing: '0.01rem'}}
                               label={"plotly username"} keystring="username" value={this.props.username}/>
                    <TextInput labelstyle={{textTransform: 'uppercase', fontWeight: 400,
                                            letterSpacing: '0.01rem', marginLeft: '30px'}}
                               tooltip={"Authenticate with your plotly API key to access private and secret plots and grids. "+
                                        "Click to find your API key in "+CONFIG.PLOTLY_DOMAIN+"/settings/api/"}
                               labellink={CONFIG.PLOTLY_DOMAIN+"/settings/api"}
                               label={"plotly api key (optional)"} keystring="apikey" value={this.props.apikey}/>
                    {auth}
                    {loadingSpinner}
                </div>
                {rows}
                {loadMoreButton}
            </div>);
    }

});

module.exports = PlotPicker;
