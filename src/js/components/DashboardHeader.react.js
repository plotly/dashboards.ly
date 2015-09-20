import React from 'react';

import DashboardHeaderEditor from './DashboardHeaderEditor';

var DashboardHeader = React.createClass({
    propTypes: {
        textInputs: React.PropTypes.shape({
            dashboardHeaderLinks: React.PropTypes.array.isRequired,
            dashboardTitle: React.PropTypes.array.isRequired,
            colors: React.PropTypes.shape({
                banner: React.PropTypes.string.isRequired,
                bannertext: React.PropTypes.string.isRequired
            }),
        }).isRequired
    },

    getInitialState: function() {
        return {settingsIsVisible: false};
    },

    hideOrShowSettings: function(){
        console.log('hideOrShowSettings', this.state.settingsIsVisible);
        this.setState({settingsIsVisible: !this.state.settingsIsVisible});
    },

    render: function() {
        let links = this.props.textInputs.dashboardHeaderLinks;
        let title = this.props.textInputs.dashboardTitle;
        let linkList = [];
        for(var i=0; i<links.length; i++) {
            linkList.push(<li>
                <a style={{color: this.props.colors.bannertext}} target="_blank" href={links[i].link}>{links[i].text}</a>
            </li>);
        }

        let settings = null;
        if(this.state.settingsIsVisible) {
            console.log('settings: ', this.state.settingsIsVisible);
            settings = (
                <div id="editor-container">
                    <DashboardHeaderEditor {...this.props}/>
                </div>
            );
        }

        return (
            <div>
                <div className="navbar" style={{backgroundColor: this.props.colors.banner}}>
                    <div className="navbar-brand">
                        {title}
                    </div>
                    <ul>{linkList}</ul>
                    <a  onClick={this.hideOrShowSettings}
                        style={{
                            float: 'right',
                            verticalAlign: 'middle',
                            border: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            marginRight: '6px',
                            minHeight: '41px',
                            lineHeight: '50px',
                            display: 'inline-block',
                            padding: '0 30px',
                            color: this.props.colors.banner,
                            textAlign: 'center',
                            letterSpacing: '0.1rem',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            borderRadius: 0,
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            fontWeight: 500
                        }}>edit banner &#9013;
                    </a>
                </div>
                {settings}
            </div>
        )
    }
});

module.exports = DashboardHeader;
