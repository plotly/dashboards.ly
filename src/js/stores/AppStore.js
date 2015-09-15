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
        _appStore.plots = action.plots
        AppStore.emitChange();
        break;

    case 'ADD_OR_REMOVE_PLOT_URL':
        let index = _appStore.selectedPlots.indexOf(action.plot_url);
        if(index === -1) {
            _appStore.selectedPlots.push(action.plot_url);
        } else {
            _appStore.selectedPlots.splice(index, 1);
        }
        AppStore.emitChange();
        break;
    }

};

AppDispatcher.register(actions);
module.exports = AppStore;

(function(){
    AppActions.initialize();
})();
