'use strict';

import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';
import {AppStore} from '../stores/AppStore';

import AppState from 'ampersand-app';
import request from 'request';

var AppActions = {

    handleResult: function (result) {
        AppDispatcher.dispatch({
            event: AppConstants.HANDLE_RESULT,
            result: result
        });
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

    initialize: function(username) {
        console.warn('initialize');
        if(ENV.mode==='create') {
            AppDispatcher.dispatch({
                event: 'SETSTORE',
                key: 'requestIsPending',
                value: true
            });
            var url = location.protocol + '//' + window.location.host + '/files?username='+username;
            console.warn(url);
            request({
                method: 'GET',
                url: url
            }, function(err, res, body) {
                AppDispatcher.dispatch({
                    event: 'SETSTORE',
                    key: 'requestIsPending',
                    value: false
                });
                if(!err && res.statusCode == 200) {
                    console.log('initialize: ', body);
                    body = JSON.parse(body);
                    console.log('DISPATCH: SETSTORE');
                    AppDispatcher.dispatch({
                        event: 'SETSTORE',
                        key: 'plots',
                        value: body.plots
                    });
                    console.log('CLEAR: SETSTORE');
                }
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
