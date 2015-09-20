import React from 'react';
import AppActions from '../actions/AppActions';

var ColorInput = React.createClass({
    propTypes: {
        color: React.PropTypes.string.isRequired,
        colorId: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        placeholder: React.PropTypes.string
    },

    updateColor: function(e) {
        console.warn('updateColor', e.target.value);
        AppActions.updateColor(this.props.colorId, e.target.value);
    },

    render: function (){
        return(<div>
            <label>{this.props.label}</label>

            <input placeholder={this.props.placeholder} onChange={this.updateColor} style={{width: '60px'}} type="text" value={this.props.color}/>

            <div style={{backgroundColor: this.props.color, width: '17px', height: '17px', marginLeft: '13px',
                         borderRadius: '5px', display: 'inline-block', 'verticalAlign': 'middle', border: 'thin lightgrey solid'}}></div>

        </div>)
    }
});

module.exports = ColorInput;
