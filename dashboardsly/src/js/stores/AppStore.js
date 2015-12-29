'use strict';

import AppDispatcher from '../dispatchers/AppDispatcher';
import BaseStore from './BaseStore';
import AppConstants from '../constants/AppConstants';
import AppActions from '../actions/AppActions';

var _appStore = {
    requestIsPending: false,
    page: 0,
    username: 'benji.b',
    apikey: 'op16fm0vke',
    plots: [],
    canRearrange: false,
    requests: [],
    isAuth: false,
    publishIsPending: false,
    publishUrl: [],
    // gets serialized as JSON in URL params
    rows: [[]],

    banner: {
        links: [
            {href: 'https://google.com', text: 'Financials'},
            {href: 'https://google.com', text: 'Growth'},
            {href: 'https://google.com', text: 'Performance'}
        ],
        title: 'Quarterly Outlook',
        backgroundcolor: AppConstants.DEFAULT_BANNER_COLOR,
        textcolor: AppConstants.DEFAULT_BANNERTEXT_COLOR,
        visible: true
    },

    requireauth: false,
    auth: {
        username: 'Acme Corp',
        passphrase: ''
    }
};

var AppStore = BaseStore.extend({

    getState: function () {
        return _appStore;
    }

});

function setDashboardRearrangability() {
    for(var i=0; i<_appStore.rows.length; i++) {
        if(_appStore.rows[i].length > 1) {
            _appStore.canRearrange = true;
            break;
        }
    }
}

var actions = function(action) {
    console.warn(action.event, '--', action)
    switch(action.event) {

    case 'SETSTORE':
        _appStore[action.key] = action.value
        AppStore.emitChange();
        break;

    case 'UPDATEKEY':
        let keystring = action.keystring; // eg 'banner.links[0].href'
        let keys = keystring.split('.');
        let obj = _appStore;
        let idx, splitOnIdx;
        for(var i=0; i<keys.length; i++) {
            console.log(obj, keys[i]);
            splitOnIdx = keys[i].split(/[\[\]]/); // split out
            if(splitOnIdx.length > 1) {
                if(i<keys.length-1) {
                    obj = obj[splitOnIdx[0]][splitOnIdx[1]];
                } else {
                    obj[splitOnIdx[0]][splitOnIdx[1]] = action.value;
                }
            } else {
                if(i<keys.length-1) {
                    obj = obj[keys[i]];
                } else {
                    obj[keys[i]] = action.value;
                }
            }
        }
        AppStore.emitChange();
        break;

    case 'ADDNEWLINK':
        console.log('ADDNEWLINK');
        _appStore.banner.links.push({link: '', text: ''});
        AppStore.emitChange();
        break;

    case 'REMOVELINK':
        console.log('REMOVELINK', action.index);
        _appStore.banner.links.splice(action.index, 1);
        AppStore.emitChange();
        break;

    case 'EXTENDPLOTS':
        if(_appStore.page===0) {
            _appStore.plots = action.plots;
        } else {
            Array.prototype.push.apply(_appStore.plots, action.plots);
        }
        AppStore.emitChange();
        break;

    case 'REMOVE_PLOT':
        // TODO - Removes *all* plots with that URL
        for(let i=0; i<_appStore.rows.length; i++) {
            for(let j=_appStore.rows[i].length-1; j>=0; j--){
                if(JSON.stringify(_appStore.rows[i][j]) ===
                   JSON.stringify(action.item)) {
                    _appStore.rows[i].splice(j, 1);
                }
            }
        }

        // Remove empty rows
        for(let i=_appStore.rows.length-1; i>=0; i--) {
            if(_appStore.rows[i].length === 0) {
                _appStore.rows.splice(i, 1);
            }
        }

        setDashboardRearrangability();
        AppStore.emitChange();
        break;

    case 'APPEND_PLOT_TO_DASHBOARD':
        _appStore.rows.push([action.item])
        setDashboardRearrangability();
        AppStore.emitChange();
        break;


    case 'MOVE_PLOT_TO_NEW_ROW':
        var dontremove=false;
        if(!action.allow_duplicates) {
            for(let i=0; i<_appStore.rows.length; i++) {
                for(let j=0; j<_appStore.rows[i].length; j++){
                    if(JSON.stringify(_appStore.rows[i][j]) ===
                       JSON.stringify(action.item)) {
                        if(i === action.targetRowNumber) {
                            dontremove=true;
                            break;
                        }
                        _appStore.rows[i].splice(j, 1);
                    }
                }
            }
        }
        if(!dontremove){
            _appStore.rows[action.targetRowNumber].push(action.item);
        }

        // Remove empty rows
        for(let i=_appStore.rows.length-1; i>=0; i--) {
            if(_appStore.rows[i].length === 0) {
                _appStore.rows.splice(i, 1);
            }
        }

        setDashboardRearrangability();
        AppStore.emitChange();
        break;
    }
};

AppDispatcher.register(actions);
exports.AppStore = AppStore;

(function(){
    AppActions.loadInitialState();
    AppActions.initialize();
})();
