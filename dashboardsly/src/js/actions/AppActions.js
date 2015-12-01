'use strict';

import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatchers/AppDispatcher';
import {AppStore} from '../stores/AppStore';
import getParameterByName from '../utils/utils';

import request from 'request';

var pendingRequest;

var AppActions = {
    updateKey: function(keystring, value) {
        AppDispatcher.dispatch({
            event: 'UPDATEKEY',
            keystring: keystring,
            value: value
        });
        // yikes
        if(keystring === 'username' || keystring === 'apikey') {
            this.initialize();
        }
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

    incrementPage: function(username) {
        let currentPage = AppStore.getState().page;
        this.updateKey('page', currentPage+1);
    },

    publishDashboard: function() {
        let that = this;
        // Serialize dashboard as JSON
        let dashboard = {
            rows: AppStore.getState().rows,
            banner: AppStore.getState().banner,
            requireauth: AppStore.getState().requireauth,
            auth: {
                username: AppStore.getState().auth.username,
                passphrase: AppStore.getState().auth.passphrase
            }
        };

        this.updateKey('publishIsPending', true);

        request({
            method: 'POST',
            url: location.origin+'/publish',
            form: {'dashboard': JSON.stringify(dashboard)}
        }, function(err, res, body) {
            that.updateKey('publishIsPending', false);
            if(!err && res.statusCode == 200) {
                let url = JSON.parse(body).url;
                let win = window.open(url, '_blank');
                let urllist = AppStore.getState().publishUrl;
                urllist.push(url);
                that.updateKey('publishUrl', urllist);
                console.warn('urllist: ', urllist);
                try {
                    win.focus();
                } catch(e) {}
            }
        });

        /*
        let win = window.open('/publish?dashboard='+encodeURIComponent(JSON.stringify(dashboard)), '_blank');
        win.focus();
        */

    },

    initialize: function() {
        console.warn('initialize');

        let initialState = getParameterByName('initialstate');
        if(initialState !== '') {
            initialState = JSON.parse(initialState);
            const validInitialStoreKeys = [
                'username', 'rows', 'banner'
            ];
            validInitialStoreKeys.forEach((v, i) => {
                if(v in initialState) {
                    AppActions.updateKey(v, initialState[v]);
                }
            });
        }

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

            const username = AppStore.getState().username;
            const page = AppStore.getState().page;
            const apikey = AppStore.getState().apikey;
            var url = location.protocol + '//' + window.location.host + '/files?username='+username+'&page='+page+'&apikey='+apikey;
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
                        event: 'SETSTORE',
                        key: 'isAuth',
                        value: body.is_authenticated
                    });
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
            let dashboard_id;
            if(window.location.pathname.indexOf('/ua-')===0) {
                dashboard_id = window.location.pathname.slice(4, window.location.pathname.length);
            } else {
                dashboard_id = window.location.pathname.slice(1, window.location.pathname.length);
            }

            request({
                method: 'GET',
                url: location.origin+'/dashboard?id='+dashboard_id
            }, function(err, res, body) {
                if(!err && res.statusCode == 200) {
                    let content = JSON.parse(body).content;
                    for(var i in content) {
                        AppDispatcher.dispatch({
                            event: 'SETSTORE',
                            key: i,
                            value: content[i]
                        });
                    }
                }
            });
        }
    }
};

module.exports = AppActions;
