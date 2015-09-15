'use strict';

import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';
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

    initialize: function() {
        var url = location.protocol + '//' + window.location.host + '/files';
        console.warn(url);
        request({
            method: 'GET',
            url: url
        }, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                console.log('initialize: ', body);
                body = JSON.parse(body);
                console.log('DISPATCH: SETSTORE');
                AppDispatcher.dispatch({
                    event: 'SETSTORE',
                    plots: body.plots
                });
                console.log('CLEAR: SETSTORE');
            }
        });
    }
};

module.exports = AppActions;
