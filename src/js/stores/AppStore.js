'use strict';

import AppDispatcher from '../dispatchers/AppDispatcher';
import BaseStore from './BaseStore';
import AppConstants from '../constants/AppConstants';
import Collection from 'ampersand-collection';
import AppActions from '../actions/AppActions';

var _appStore = {
    requestIsPending: false,
    page: 0,
    username: 'christopherp',
    rows: [[]],
    plots: [],
    canRearrange: false,

    // Weird datastructure to abstract out updating text inputs with a
    // key, index, key lookup
    textInputs: {
        dashboardHeaderLinks: [
            {link: 'https://google.com', text: 'Financials'},
            {link: 'https://google.com', text: 'Growth'},
            {link: 'https://google.com', text: 'Performance'}
        ],
        dashboardTitle: [{text: 'Quarterly Outlook'}]
    },

    colors: {
        banner: AppConstants.DEFAULT_BANNER_COLOR,
        bannertext: AppConstants.DEFAULT_BANNERTEXT_COLOR
    }
}

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
    switch(action.event) {

    case 'SETSTORE':
        _appStore[action.key] = action.value
        AppStore.emitChange();
        break;

    case 'SETINPUT':
        _appStore.textInputs[action.inputId][action.index][action.inputKey] = action.value;
        AppStore.emitChange();
        break;

    case 'UPDATECOLOR':
        console.warn('UPDATECOLOR', action.colorId, action.color);
        _appStore.colors[action.colorId] = action.color;
        AppStore.emitChange();
        break;

    case 'ADDNEWLINK':
        console.log('ADDNEWLINK');
        _appStore.textInputs.dashboardHeaderLinks.push({link: '', text: ''});
        AppStore.emitChange();
        break;

    case 'REMOVELINK':
        console.log('REMOVELINK', action.index);
        _appStore.textInputs.dashboardHeaderLinks.splice(action.index, 1);
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
        for(var i=0; i<_appStore.rows.length; i++) {
            for(var j=0; j<_appStore.rows[i].length; j++){
                if(_appStore.rows[i][j].plot_url === action.plot_url) {
                    _appStore.rows[i].splice(j, 1);
                }
            }
        }
        setDashboardRearrangability();
        AppStore.emitChange();
        break;

    case 'APPEND_PLOT_TO_DASHBOARD':
        _appStore.rows.push([{'plot_url': action.plot_url}])
        setDashboardRearrangability();
        AppStore.emitChange();
        break;


    case 'MOVE_PLOT_TO_NEW_ROW':
        var i, j;
        var dontremove=false;
        if(!action.allow_duplicates) {
            for(i=0; i<_appStore.rows.length; i++) {
                for(j=0; j<_appStore.rows[i].length; j++){
                    if(_appStore.rows[i][j].plot_url === action.plot_url) {
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
            _appStore.rows[action.targetRowNumber].push({'plot_url': action.plot_url});
        }
        setDashboardRearrangability();
        AppStore.emitChange();
        break;

    case 'ADD_KEY_TO_PLOT_OBJECT':
        for(i=0; i<_appStore.rows.length; i++) {
            for(j=0; j<_appStore.rows[i].length; j++){
                if(_appStore.rows[i][j].plot_url === action.plot_url) {
                    _appStore.rows[i][j][action.key] = action.value;
                }
            }
        }
        AppStore.emitChange();
        break;
    }

};

AppDispatcher.register(actions);
exports.AppStore = AppStore;

(function(){
    AppActions.initialize();
})();
