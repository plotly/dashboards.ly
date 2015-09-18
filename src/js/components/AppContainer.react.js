'use strict';

import React from 'react';
import {AppStore} from '../stores/AppStore';
import AppActions from '../actions/AppActions';
import appStoreMixin from './AppStore.mixin.js';

var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd/modules/backends/HTML5');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;

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

var IframeSettings = React.createClass({
    render: function() {
        return (<img
            style={{
                'float': 'right',
                'height': '17px',
                'display': 'inline-block',
                'marginTop': '3px',
                'marginBottom': 'auto'
            }}
            src="http://www.clker.com/cliparts/Z/q/J/9/Q/w/grey-gear-md.png"/>);
    }
});

var InputTitle = React.createClass({
    propTypes: {
        placeholder: React.PropTypes.string,
        plot_url: React.PropTypes.string
    },
    getInitialState: function() {
        return {value: ''};
    },
    handleChange: function(event) {
        AppActions.addKeyToPlotObject({
            plot_url: this.props.plot_url,
            key: 'title',
            value: event.target.value
        });
        this.setState({value: event.target.value});
    },
    render: function() {
        return (<span>
            <input
            className="chart-title"
            placeholder={this.props.placeholder}
            type="text" value={this.state.value}
            onChange={this.handleChange}/>
        </span>)
    }
});

var IframePanelz = React.createClass({
    propTypes: {
        plot_url: React.PropTypes.string.isRequired,
        connectDragSource: React.PropTypes.func.isRequired,
        isDragging: React.PropTypes.bool.isRequired
    },

    render: function() {
        let connectDragSource = this.props.connectDragSource;
        let isDragging = this.props.isDragging;

        // let iframeUrl = this.props.plot_url + '.embed?autosize=true&link=false&source=false';
        let imageUrl = this.props.plot_url + '.png';
        let chartStyle = {}; // {'height': '450px'};
        let chartClasses = 'chart-wrapper grab';
        let titleBlock = null;
        if(ENV.mode==='create') {
            titleBlock = <InputTitle plot_url={this.props.plot_url} placeholder="plot title (optional)"/>
        }

        if(this.props.plot_url) {
            return connectDragSource(
                <div style={chartStyle} className={chartClasses}>
                    {titleBlock}
                    <img style={{width: '100%'}} src={imageUrl}/>
                </div>
            )
        } else {
            return(<div style={chartStyle} className="chart-wrapper"></div>)
        }
    }
});

var DraggablePlotSource = {
    beginDrag: function(props, monitor, component) {
        return {id: props.plot_url};
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

var IframePanel = DragSource('IframePanel', DraggablePlotSource, collect)(IframePanelz);


var RowTarget = React.createClass({
    propTypes: {
        isOver: React.PropTypes.bool.isRequired,
        canDrop: React.PropTypes.bool.isRequired,
        plots: React.PropTypes.array.isRequired,
        rowNumber: React.PropTypes.number.isRequired
    },

    gridColumnWidth: function (n) {
        let padding=2.
        return (100-padding*(n-1))/n + '%';
    },

    render: function () {
        let connectDropTarget = this.props.connectDropTarget;
        let isOver = this.props.isOver;
        let canDrop = this.props.canDrop;
        let style={'backgroundColor': 'lightblue', 'width': '300px', 'height': '300px'};
        if(isOver){
            style.backgroundColor = 'darkblue';
        }
        let columns = [];
        for(var i=0; i<this.props.plots.length; i++) {
            columns.push(
                <div style={{width: this.gridColumnWidth(this.props.plots.length)}} className="columns">
                    <IframePanel plot_url={this.props.plots[i].plot_url}/>
                </div>)
        }
        return connectDropTarget(<div className="row">{columns}</div>);
    }
});

var panelTarget = {
    hover: function(props, monitor) {
        let targetRowNumber = props.rowNumber
        let plot_url = monitor.getItem().id;
        console.warn('HOVER: Plot '+plot_url+' -> '+targetRowNumber);
        AppActions.movePlotToRow(plot_url, targetRowNumber);
    },

    drop: function(props, monitor) {
        let targetRowNumber = props.rowNumber
        let plot_url = monitor.getItem().id;
        AppActions.movePlotToRow(plot_url, targetRowNumber);
    },

    canDrop: function(props) {
        return true;
    }
}

function panelCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

var Row = DropTarget('IframePanel', panelTarget, panelCollect)(RowTarget);


var Dashboard = React.createClass({
    propTypes: {
        rows: React.PropTypes.array.isRequired
    },

    handleClick: function (event) {
        AppActions.publishDashboard();
    },

    render: function() {
        let rows = this.props.rows;
        if(rows.length===0) {
            let divStyle = {
                'text-align': 'center'
            };
            return (<div className="container">
                <div style={divStyle}></div>
            </div>)
        } else {
            let rowItems = [];
            for(var i=0; i<rows.length; i++) {
                rowItems.push(<Row plots={this.props.rows[i]} rowNumber={i}/>);
            }

            let footer = null;
            if(ENV.mode === 'create') {
                footer = (<div style={{textAlign: 'center', padding: '30px'}}>
                    <a id="generate" onClick={this.handleClick} className="button">publish dashboard</a>
                </div>);
            }
            return (
                <div>
                    <div style={{boxShadow: '0 0 12px 1px rgba(87,87,87,0.2)', backgroundColor: 'f9f9f9'}} className="container">
                        {rowItems}
                    </div>
                    {footer}
            </div>);
        }
    }
});

var UsernameInput = React.createClass({
    propTypes: {
        username: React.PropTypes.string
    },
    getInitialState: function() {
        return {value: 'PewResearch'};
    },
    handleChange: function(event) {
        this.setState({value: event.target.value});
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
            type="text" value={this.state.value}
            onChange={this.handleChange}/>)
    }
});

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
                        <ImagePanel {...this.props.plots[i]}/>
                    </div>
                    <div className="three columns">
                        <ImagePanel {...this.props.plots[i+1]}/>
                    </div>
                    <div className="three columns">
                        <ImagePanel {...this.props.plots[i+2]}/>
                    </div>
                    <div className="three columns">
                        <ImagePanel {...this.props.plots[i+3]}/>
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
                    <UsernameInput/> {loadingSpinner}
                </div>
                {rows}
                {loadMoreButton}
            </div>);
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

    handlePublishClick: function (event) {
        AppActions.publishDashboard();
    },

    render: function () {
        let state = this.getState();

        if(!('plots' in state) && state.rows.length === 0) {
            return (<img
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'block',
                    marginTop: '50px'
                }}
                src="http://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"/>)
        }

        if(ENV.mode === 'create') {

            return (
                <div>
                    <Dashboard rows={state.rows}/>
                    <PlotPicker {...this.state}/>
                </div>
            );

        } else {
            return (<div>
                <Dashboard rows={state.rows}/>
            </div>)
        }
    }
});

module.exports = DragDropContext(HTML5Backend)(AppContainer);
