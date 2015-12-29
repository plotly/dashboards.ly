'use strict';

import React from 'react';
var DragSource = require('react-dnd').DragSource;
import AppActions from '../actions/AppActions';
import ComponentTypes from '../constants/ComponentTypes';

var DashboardPlotBlock = React.createClass({
    propTypes: {
        item: React.PropTypes.object.isRequired,
        connectDragSource: React.PropTypes.func.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        canRearrange: React.PropTypes.bool.isRequired
    },

    handleRemovePlot: function(e) {
        AppActions.removePlotFromDashboard(this.props.item);
    },

    getInitialState: function(){
        return {'cursor': '-webkit-grab'};
    },

    handleDraggingMouseDown: function(e) {
        console.log('mouse down!');
        this.setState({'cursor': '-webkit-grabbing'});
    },

    handleDraggingMouseUp: function(e) {
        console.log('mouse up!');
        this.setState({'cursor': '-webkit-grab'});
    },

    render: function() {
        let connectDragSource = this.props.connectDragSource;
        let isDragging = this.props.isDragging;
        let content = null;
        const itemStyle = {
            'border': '1px solid #e2e2e2',
            'borderRadius': '3px'
        };
        const iframeStyle = {
            maxWidth: '100%',
            minHeight: '50vh',
            maxHeight: '80vh',
            objectFit: 'contain',
            margin: '0 auto',
            display: 'block',
            border: 'none',
            borderRadius: '3px'
        };
        if('type' in this.props.item) {
          if(this.props.item.type === 'image') {
              content = <img src={this.props.item.src} style={iframeStyle}/>;
          }
          // We could add other types of contents here, like iframes or tables
        } else if('plot_url' in this.props.item) {
          let plot_url = this.props.item.plot_url;
          let iframeUrl = plot_url + '.embed?autosize=true&link=false&source=false' + (sharekey ? '&share_key='+sharekey : '');
          content = <iframe src={iframeUrl} style={iframeStyle}></iframe>;
          let sharekey;
          if(plot_url.indexOf('share_key') > -1){
              sharekey = plot_url.slice(plot_url.indexOf('?share_key=')+'?share_key='.length, plot_url.length);
              plot_url = plot_url.replace('?share_key='+sharekey, '');
          }
          content = <iframe src={iframeUrl} style={iframeStyle}></iframe>
        } else {
          return(<div style={itemStyle} className="chart-wrapper"></div>);
        }
        let dragBar = null;
        if(this.props.canRearrange) {
            dragBar = (<div style={{height: '18px'}}>
                <a onClick={this.handleRemovePlot} style={{'cursor': 'pointer', 'float': 'left', 'fontSize': '18px', 'lineHeight': '18px', 'paddingLeft': '4px', 'color': 'rgb(80, 107, 123)'}}>&times;</a>
                <a className="grab"
                    style={{
                        cursor: this.state.cursor,
                        float: 'right',
                        lineHeight: '16px',
                        fontSize: '10px',
                        color: '#555555',
                        textTransform: 'uppercase'
                    }}
                    onMouseDown={this.handleDraggingMouseDown}
                    onMouseUp={this.handleDraggingMouseUp}>
                    <span style={{verticalAlign: 'middle', paddingRight: '3px'}}>drag to rearrange</span>
                    <img style={{'height': '14px', verticalAlign: 'middle'}} src="http://i.imgur.com/F5biwyG.png"/>
                </a>
            </div>)
        }
        let draggableItem = (<div style={itemStyle} className={'chart-wrapper'}>
            {dragBar}
            {content}
        </div>);

        if(ENV.mode === 'create'){
          return connectDragSource(draggableItem);
        } else {
          // Items are not draggable in publish view
          return draggableItem;
        }

    }
});

var DraggableBlockSpec = {
    beginDrag: function(props, monitor, component) {
        return {item: props.item};
    },
    endDrag: function(props, monitor, component) {
        console.log('endDrag');
        if(component) {
            component.handleDraggingMouseUp();
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

exports.DashboardPlotBlock = DragSource(ComponentTypes.DRAGGABLE_PLOT_BLOCK, DraggableBlockSpec, collect)(DashboardPlotBlock);
