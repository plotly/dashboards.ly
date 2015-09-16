'use strict';

import AppDispatcher from '../dispatchers/AppDispatcher';
import BaseStore from './BaseStore';
import AppConstants from '../constants/AppConstants';
import Collection from 'ampersand-collection';
import AppActions from '../actions/AppActions';

var _appStore = {
    selectedPlots: [],
    requestIsPending: false,
    page: 0,
    username: 'PewResearch',
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
        var i;
        var removed=false;
        for(i=0; i<_appStore.selectedPlots.length; i++) {
            if(_appStore.selectedPlots[i].plot_url === action.plot_url) {
                console.warn('removing', i, action.plot_url);
                _appStore.selectedPlots.splice(i, 1);
                removed=true;
            }
        }
        if(!removed){
            _appStore.selectedPlots.push({'plot_url': action.plot_url});
        }
        console.warn('selectedPlots: ', _appStore.selectedPlots);
        AppStore.emitChange();
        break;

    case 'ADD_KEY_TO_PLOT_OBJECT':
        for(var i=0; i<_appStore.selectedPlots.length; i++) {
            if(_appStore.selectedPlots[i].plot_url === action.plot_url) {
                _appStore.selectedPlots[action.plot_url][action.key] = action.value;
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
