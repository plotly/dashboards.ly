'use strict';

import React from 'react';
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd/modules/backends/HTML5');

import {AppStore} from '../stores/AppStore';
import AppActions from '../actions/AppActions';
import appStoreMixin from './AppStore.mixin.js';

import Dashboard from './Dashboard.react';
import PlotPicker from './PlotPicker.react';

console.warn('test');

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

        let plotPicker = null;
        let footer = null;
        if(ENV.mode === 'create') {
            plotPicker = <PlotPicker {...this.state}/>
            let astyle = {'paddingLeft': '5px', 'paddingRight': '5px'};
            footer = (<div style={{textAlign: "center", paddingTop: "30px;"}}>
                <span>
                    <a style={astyle} target="_blank" className="muted" href="https://github.com/plotly/dashboards.ly"><i class="fa fa-github-alt"></i> Fork on GitHub</a>
                    -
                    <a style={astyle} target="_blank" className="muted" href="http://help.plot.ly/dashboards.ly/">FAQ</a>
                    -
                    <a style={astyle} target="_blank" className="muted" href="http://help.plot.ly/dashboards.ly/">Documentation</a>
                    -
                    <a style={astyle} target="_blank" className="muted" href="https://dashboards.ly/ua-mUzaU5RwdSdaz5ERTudSZH">Example Dashboard</a>
                </span>
            </div>);
        }

        return (
            <div>
                <Dashboard {...this.state}/>
                <div style={{paddingTop: '40px'}}></div>
                {plotPicker}
                {footer}
            </div>
        );
    }
});

module.exports = DragDropContext(HTML5Backend)(AppContainer);
