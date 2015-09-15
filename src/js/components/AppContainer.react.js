'use strict';

import React from 'react';
import AppStore from '../stores/AppStore';
import AppActions from '../actions/AppActions';
import appStoreMixin from './AppStore.mixin.js';

var ImagePanel = React.createClass({
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
        this.setState({selected: !this.state.selected});
        AppActions.addOrRemovePlotUrl(this.props.plot_url);
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
            'background-position-x': 'center',
            'background-position-y': 'center',
            'background-size': 'cover',
            'background-repeat': 'no-repeat'
        };
        let overlayStyle = {
            'background': 'rgba(0,0,0,.5)',
            'text-align': 'center',
            'padding': '45px 0 66px 0',
            'opacity': this.state.hover ? 1 : 0,
            '-webkit-transition': 'opacity .25s ease',
            '-moz-transition': 'opacity .25s ease'
        };
        let hoverTextStyle =  {
           'color': 'rgba(255,255,255,.85)',
           'font-size': '18px',
           'font-weight': 200
       };

        return (<div className="chart-wrapper">
            <div onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} className="chart-stage">
                <div style={imageStyle} onClick={this.handleChange}>
                    <div style={overlayStyle}>
                        <span style={hoverTextStyle}>
                            {this.state.selected ? 'remove' : 'add to dashboard'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="chart-notes">
                {this.props.plot_name}
            </div>
        </div>);

    }
});

var IframePanel = React.createClass({
    propTypes: {
        plot_url: React.PropTypes.string.isRequired
    },

    render: function() {
        let iframeUrl = this.props.plot_url + '.embed?autosize=true&link=false';
        let iframeStyle = {'border': 'none', 'height': '100%'};
        let chartStyle = {'height': '450px'};
        if(this.props.plot_url) {
            return(
                <div style={chartStyle} className="chart-wrapper">
                    <iframe style={iframeStyle} width="100%" src={iframeUrl}></iframe>
                </div>
            )
        } else {
            return(<div style={chartStyle} className="chart-wrapper"></div>)
        }
    }
});

var Dashboard = React.createClass({
    propTypes: {
        urls: React.PropTypes.array.isRequired
    },
    render: function() {
        let containerStyle = {};
        let urls = this.props.urls;
        if(urls.length===0) {
            let divStyle = {
                'text-align': 'center'
            };
            return (<div style={containerStyle} className="container">
                <div style={divStyle}>dashboard.ly</div>
            </div>)
        } else {
            let rows = [];
            for(var i=0; i<urls.length; i+=2) {
                rows.push(
                    <div className="row">
                        <div className="six columns">
                            <IframePanel plot_url={urls[i]}/>
                        </div>
                        <div className="six columns">
                            <IframePanel plot_url={urls[i+1]}/>
                        </div>
                    </div>)
            }
            return (<div style={containerStyle} className="container">
                {rows}
                <a id="generate" style={{float: "right"}} className="button">generate dashboard</a>
            </div>);
        }
    }
});

var AppContainer = React.createClass({
    getInitialState: function () {
        return this.getState();
    },

    mixins: [appStoreMixin],

    getState: function () {
        return AppStore.getState()
    },

    _onChange: function () {
        this.setState(this.getState());
    },

    render: function () {
        console.log('render: AppContainer');
        let state = this.getState();
        if(!('plots' in state)) {
            return (<div>loading...</div>)
        } else {
            let rows = [];
            for(var i=0; i<state.plots.length; i+=4) {
                rows.push(
                    <div className="row">
                        <div className="three columns">
                            <ImagePanel {...state.plots[i]}/>
                        </div>
                        <div className="three columns">
                            <ImagePanel {...state.plots[i+1]}/>
                        </div>
                        <div className="three columns">
                            <ImagePanel {...state.plots[i+2]}/>
                        </div>
                        <div className="three columns">
                            <ImagePanel {...state.plots[i+3]}/>
                        </div>
                    </div>)
            }
            return (
                <div>
                    <Dashboard urls={state.selectedPlots}/>
                    {rows}
                </div>
            );
        }
    }
});

module.exports = AppContainer;
