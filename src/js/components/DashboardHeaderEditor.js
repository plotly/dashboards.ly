import React from 'react';
import AppActions from '../actions/AppActions';
import AppConstants from '../constants/AppConstants';
import ColorInput from './ColorInput.react';

var TextInput = React.createClass({
    propTypes: {
        index: React.PropTypes.number.isRequired,
        inputId: React.PropTypes.string.isRequired,
        inputKey: React.PropTypes.string.isRequired,
        label: React.PropTypes.string.isRequired,
        value: React.PropTypes.string.isRequired,
        isVisible: React.PropTypes.bool.isRequired
    },

    updateInput: function(e) {
        console.warn('updateInput', e.target.value)
        AppActions.updateInput(this.props.inputId, this.props.index, this.props.inputKey, e.target.value);
    },

    render: function() {
        return (
        <div style={{display: "inline-block"}}>
            <label className="chart-title">{this.props.label}</label>
            <input onChange={this.updateInput} type="text" value={this.props.value}/>
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
    propTypes: {
        textInputs: React.PropTypes.shape({
            dashboardHeaderLinks: React.PropTypes.array.isRequired,
            dashboardTitle: React.PropTypes.array.isRequired,
        }).isRequired
    },

    addNewLink: function(e) {
        AppActions.addNewLink();
    },

    render: function() {
        let links = this.props.textInputs.dashboardHeaderLinks;
        let title = this.props.textInputs.dashboardTitle[0].text;

        let linkOptions = [];
        for(var i=0; i<links.length; i++) {
            linkOptions.push(<div>
                <TextInput key={i*2}   inputId="dashboardHeaderLinks" index={i} inputKey="text" label="link name" value={links[i].text}/>
                <TextInput key={i*2+1} inputId="dashboardHeaderLinks" index={i} inputKey="link" label="link target" value={links[i].link}/>
                <RemoveLinkButton index={i}/>
            </div>);
        }
        let loadMoreLinks = <div onClick={this.addNewLink} style={{cursor: "pointer", fontSize: "10px"}}>+ add header link</div>;

        return (
        <div style={{backgroundColor: "white", width: "450px", border: "thin lightgrey solid",
                     padding: "5px", marginRight: "5px", position: "relative", zIndex: 5,
                     float: 'right'}}>
            banner settings
            <hr/>
            <TextInput inputId="dashboardTitle" index={0} inputKey="text" label="brand or dashboard title" value={title}/>
            <hr/>
            {linkOptions}
            {loadMoreLinks}
            <hr/>
            <ColorInput placeholder={AppConstants.DEFAULT_BANNER_COLOR} label="background color" colorId="banner" color={this.props.colors.banner}/>
            <ColorInput placeholder={AppConstants.DEFAULT_BANNERTEXT_COLOR} label="text color" colorId="bannertext" color={this.props.colors.bannertext}/>
        </div>);
    }
});

module.exports = DashboardHeaderEditor;
