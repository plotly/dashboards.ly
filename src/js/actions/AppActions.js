'use strict';

import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';
import {AppStore} from '../stores/AppStore';

import AppState from 'ampersand-app';
import request from 'request';

var AppActions = {
    updateStore: function(key, value) {
        AppDispatcher.dispatch({
            event: 'SETSTORE',
            key: key,
            value: value
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

    addOrRemovePlotUrl: function(plot_url) {
        AppDispatcher.dispatch({
            event: 'ADD_OR_REMOVE_PLOT_URL',
            plot_url: plot_url
        });
    },

    publishDashboard: function() {
        // Serialize dashboard as JSON
        let plots = AppStore.getState().selectedPlots;
        let win = window.open('/view?plots='+encodeURIComponent(JSON.stringify(plots)), '_blank');
        win.focus();
    },



    initialize: function() {
        console.warn('initialize');
        let username = AppStore.getState().username;
        let page = AppStore.getState().page;
        if(ENV.mode==='create') {
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
            request({
                method: 'GET',
                url: url
            }, function(err, res, body) {
                if(!err && res.statusCode == 200) {
                    console.log('initialize: ', body);
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
            let plots = JSON.parse(decodeURIComponent(window.location.search.slice(window.location.search.indexOf('plots=')+'plots='.length, window.location.search.length)));
            console.warn(plots);
            AppDispatcher.dispatch({
                event: 'SETSTORE',
                key: 'selectedPlots',
                value: plots
            });
        }
    }
};

module.exports = AppActions;
