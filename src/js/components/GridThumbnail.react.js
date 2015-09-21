'use strict'

import React from 'react';
import AppActions from '../actions/AppActions';

var GridThumbnail = React.createClass({
    propTypes: {
        grid_name: React.PropTypes.string.isRequired,
        preview: React.PropTypes.object.isRequired
    },


    getInitialState: function(){
        return {
            hover: false,
            selected: false
        };
    },

    handleChange: function(event) {
        AppActions.addPlotToDashboard(this.props.url);
    },

    mouseOver: function() {
        this.setState({hover: true});
    },

    mouseOut: function() {
        this.setState({hover: false});
    },

    render: function() {
        let preview = this.props.preview;

        let tableHeaderCells = [];
        for(let i=0; i<preview.column_names.length; i++) {
            tableHeaderCells.push(<th>{preview.column_names[i]}</th>);
        }

        let tableRows = [];
        let tableRow;
        for(let i=0; i<preview.data.length; i++) {
            tableRow = [];
            for(let j=0; j<preview.data[i].length; j++) {
                tableRow.push(<td>{preview.data[i][j]}</td>);
            }
            tableRows.push(<tr>{tableRow}</tr>);
        }

        let overlayStyle = {
            opacity: this.state.hover ? 1 : 0,
            position: 'absolute',
            top: 0, bottom: 0, width: '100%', height: '100%', padding: 0
        };
        let overlayTextStyle = {
            position: 'absolute', verticalAlign: 'middle'
        }

        return (<div onClick={this.handleChange} className="chart-wrapper">
            <div style={{height: '140px', overflowY: 'hidden', cursor: 'pointer'}}
                onMouseOver={this.mouseOver} onMouseOut={this.mouseOut} className="chart-stage">
                <div style={{position: 'relative'}}>
                    <table className="thumbnail-table">
                        <thead>
                            <tr>{tableHeaderCells}</tr>
                        </thead>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </table>
                    <div className="overlay" style={overlayStyle}>
                        <span className="overlay-text">add to dashboard</span>
                    </div>
                </div>
            </div>

            <div className="chart-notes">
                {this.props.name}
            </div>
        </div>)
    }
});

module.exports = GridThumbnail;
