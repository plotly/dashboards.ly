'use strict';

import AppDispatcher from '../dispatchers/AppDispatcher';
import BaseStore from './BaseStore';
import AppConstants from '../constants/AppConstants';
import Collection from 'ampersand-collection';
import AppActions from '../actions/AppActions';

var _appStore = {
    selectedPlots: []
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

    case 'ADD_OR_REMOVE_PLOT_URL':
        var i;
        for(i=0; i<_appStore.selectedPlots.length; i++) {
            if(_appStore.selectedPlots[i].plot_url === action.plot_url) {
                _appStore.selectedPlots.splice(i, 1);
            }
        }
        console.warn(i);
        if(i===_appStore.selectedPlots.length){
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
