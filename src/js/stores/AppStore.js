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
    plots: []
}

var AppStore = BaseStore.extend({

    getState: function () {
        return _appStore;
    }

});

var actions = function(action) {
    switch(action.event) {

    case 'SETSTORE':
        _appStore[action.key] = action.value
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

    case 'ADD_OR_REMOVE_PLOT_URL':
        var i, j;
        var dontremove=false;
        for(i=0; i<_appStore.rows.length; i++) {
            for(j=0; j<_appStore.rows[i].length; j++){
                if(_appStore.rows[i][j].plot_url === action.plot_url) {
                    if(i === action.targetRowNumber) {
                        dontremove=true;
                        continue;
                    }
                    console.warn('removing', i, j, action.plot_url);
                    _appStore.rows[i].splice(j, 1);
                }
            }
        }
        if(!dontremove){
            console.warn('removing', i, j, action.plot_url);
            if(action.targetRowNumber===-1) {
                _appStore.rows.push([{'plot_url': action.plot_url}])
            } else {
                _appStore.rows[action.targetRowNumber].push({'plot_url': action.plot_url});
            }
        }
        console.warn('rows: ', _appStore.rows);
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
