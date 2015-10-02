import React from 'react';
import AppActions from '../actions/AppActions';
import AppConstants from '../constants/AppConstants';
import ColorInput from './ColorInput.react';
import TextInput from './TextInput.react';

var CheckBox= React.createClass({

    propTypes: {
        label: React.PropTypes.string.isRequired,
        checked: React.PropTypes.bool.isRequired,
        keystring: React.PropTypes.string.isRequired
    },

    updateInput: function(e) {
        console.warn('updateInput: ', this.props.keystring, e.target.checked);
        AppActions.updateKey(this.props.keystring, e.target.checked);
    },

    render: function() {
        let input;
        if(this.props.checked) {
            input = <input onChange={this.updateInput} type="checkbox" checked="checked"/>
        } else {
            input = <input onChange={this.updateInput} type="checkbox"/>
        }

        return (
        <div style={{display: "inline-block"}}>
            <label className="chart-title">{this.props.label}</label>
            {input}
        </div>);
    }

});

var RemoveLinkButton = React.createClass({
    propTypes: {
        index: React.PropTypes.number.isRequired
    },

    removeLink: function() {
        AppActions.removeLink(this.props.index);
    },

    render: function() {
        return (<div onClick={this.removeLink} style={{float: "right", cursor: "pointer"}}>&times;</div>)
    }
});

var DashboardHeaderEditor = React.createClass({
    propTypes: {},

    addNewLink: function(e) {
        AppActions.addNewLink();
    },

    render: function() {
        let linkOptions = [];
        for(var i=0; i<this.props.banner.links.length; i++) {
            linkOptions.push(<div>
                <TextInput key={i*2}    value={this.props.banner.links[i].text} keystring={'banner.links['+i+'].text'} label="link name" />
                <TextInput key={i*2+1}  value={this.props.banner.links[i].href} keystring={'banner.links['+i+'].href'} label="link target"/>
                <RemoveLinkButton index={i}/>
            </div>);
        }
        let loadMoreLinks = <div onClick={this.addNewLink} style={{cursor: "pointer", fontSize: "1.3rem"}}>+ add header link</div>;

        let authenticationBlock = null;
        if(this.props.requireauth) {
            authenticationBlock = (<div>
                <TextInput label="username" keystring="auth.username" value={this.props.auth.username}/>
                <TextInput label="passphrase" keystring="auth.passphrase" value={this.props.auth.passphrase} type="password"/>
                <hr/>
            </div>)
        }

        return (
        <div style={{backgroundColor: "white", width: "450px", border: "thin lightgrey solid",
                     padding: "5px", marginRight: "5px", position: "relative", zIndex: 5,
                     float: 'right'}}>
            <div>
            <CheckBox label="require password authentication" keystring="requireauth" checked={this.props.requireauth}/>
            </div>
            {authenticationBlock}
            <CheckBox label="show banner" keystring="banner.visible" checked={this.props.banner.visible}/>
            <hr/>
            <TextInput label="brand or dashboard title" keystring="banner.title" value={this.props.banner.title}/>
            <hr/>
            {linkOptions}
            {loadMoreLinks}
            <hr/>
            <ColorInput placeholder={AppConstants.DEFAULT_BANNER_COLOR} label="background color" keystring="banner.backgroundcolor" color={this.props.banner.backgroundcolor}/>
            <ColorInput placeholder={AppConstants.DEFAULT_BANNERTEXT_COLOR} label="text color"   keystring="banner.textcolor"       color={this.props.banner.textcolor}/>
        </div>);
    }
});

module.exports = DashboardHeaderEditor;
