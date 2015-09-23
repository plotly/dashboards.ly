'use strict';

import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';
import {AppStore} from '../stores/AppStore';

import AppState from 'ampersand-app';
import request from 'request';

var pendingRequest;

var AppActions = {
    updateStore: function(key, value) {
        AppDispatcher.dispatch({
            event: 'SETSTORE',
            key: key,
            value: value
        });
    },

    updateKey: function(keystring, value) {
        AppDispatcher.dispatch({
            event: 'UPDATEKEY',
            keystring: keystring,
            value: value
        });
    },

    addNewLink: function(){
        AppDispatcher.dispatch({event: 'ADDNEWLINK'});
    },

    removeLink: function(i){
        console.log('removeLink');
        AppDispatcher.dispatch({event: 'REMOVELINK', index: i});
    },

    addPlotToDashboard: function(plot_url) {
        AppDispatcher.dispatch({
            event: 'MOVE_PLOT_TO_NEW_ROW',
            plot_url: plot_url,
            targetRowNumber: AppStore.getState().rows.length-1,
            allow_duplicates: true
        });
    },

    appendPlotToDashboard: function(plot_url) {
        AppDispatcher.dispatch({
            event: 'APPEND_PLOT_TO_DASHBOARD',
            plot_url: plot_url
        });
    },

    removePlotFromDashboard: function(plot_url) {
        AppDispatcher.dispatch({
            event: 'REMOVE_PLOT',
            plot_url: plot_url
        });
    },

    movePlotToNewRow: function(plot_url, rowNumber) {
        AppDispatcher.dispatch({
            event: 'MOVE_PLOT_TO_NEW_ROW',
            plot_url: plot_url,
            targetRowNumber: rowNumber,
            allow_duplicates: false
        });
    },

    updateUsername: function(username) {
        this.updateStore('username', username);
        this.updateStore('page', 0);
    },

    incrementPage: function(username) {
        let currentPage = AppStore.getState().page;
        this.updateStore('page', currentPage+1);
    },

    publishDashboard: function() {
        // Serialize dashboard as JSON
        let dashboard = {
            'rows': AppStore.getState().rows,
            'banner': AppStore.getState().banner
        };
        let win = window.open('/view?plots='+encodeURIComponent(JSON.stringify(dashboard)), '_blank');
        win.focus();
    },

    initialize: function() {
        console.warn('initialize');
        let username = AppStore.getState().username;
        let page = AppStore.getState().page;
        if(ENV.mode==='create') {
            if(pendingRequest) {
                pendingRequest.abort();
            }
            AppDispatcher.dispatch({
                event: 'SETSTORE',
                key: 'requestIsPending',
                value: true
            });
            AppDispatcher.dispatch({
                event: 'SETSTORE',
                key: 'requestWasEmpty',
                value: false
            });
            var url = location.protocol + '//' + window.location.host + '/files?username='+username+'&page='+page;
            console.warn(url);
            pendingRequest = request({
                method: 'GET',
                url: url
            }, function(err, res, body) {
                if(!err && res.statusCode == 200) {
                    body = JSON.parse(body);
                    console.log('DISPATCH: SETSTORE');
                    if((page===0 && body.plots.length === 0) || body.is_last === true) {
                        AppDispatcher.dispatch({
                            event: 'SETSTORE',
                            key: 'requestWasEmpty',
                            value: true
                        });
                    } else {
                        AppDispatcher.dispatch({
                            event: 'SETSTORE',
                            key: 'requestWasEmpty',
                            value: false
                        });
                    }
                    AppDispatcher.dispatch({
                        event: 'EXTENDPLOTS',
                        plots: body.plots
                    });
                    console.log('CLEAR: SETSTORE');
                } else if(res.statusCode == 404) {
                    AppDispatcher.dispatch({
                        event: 'SETSTORE',
                        key: 'requestWasEmpty',
                        value: true
                    });
                }
                AppDispatcher.dispatch({
                    event: 'SETSTORE',
                    key: 'requestIsPending',
                    value: false
                });
            });
        } else if(ENV.mode==='view') {
            console.warn('view');
            let dashboardRepr = JSON.parse(decodeURIComponent(window.location.search.slice(window.location.search.indexOf('plots=')+'plots='.length, window.location.search.length)));
            console.warn(dashboardRepr);
            for(var i in dashboardRepr) {
                AppDispatcher.dispatch({
                    event: 'SETSTORE',
                    key: i,
                    value: dashboardRepr[i]
                });
            }
        }
    }
};

module.exports = AppActions;
