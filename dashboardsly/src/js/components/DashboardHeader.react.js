import React from 'react';

import DashboardHeaderEditor from './DashboardHeaderEditor';

var DashboardHeader = React.createClass({
    propTypes: {
        banner: React.PropTypes.shape({
            links: React.PropTypes.arrayOf(
                React.PropTypes.shape({
                    link: React.PropTypes.string,
                    text: React.PropTypes.string
                })
            ),
            title: React.PropTypes.string,
            backgroundcolor: React.PropTypes.string,
            textcolor: React.PropTypes.string,
            showbanner: React.PropTypes.bool
        }).isRequired
    },

    getInitialState: function() {
        return {settingsIsVisible: false};
    },

    hideOrShowSettings: function(){
        this.setState({settingsIsVisible: !this.state.settingsIsVisible});
    },

    render: function() {
        let banner = null;
        if(this.props.banner.visible!==false) {
            let links = this.props.banner.links;
            let title = this.props.banner.title;
            let linkList = [];
            for(var i=0; i<links.length; i++) {
                linkList.push(<li key={i}>
                    <a href={links[i].href}
                       style={{color: this.props.banner.textcolor}}
                       target="_blank" >{links[i].text}</a>
                </li>);
            }

            banner = (
                <div className="navbar" style={{backgroundColor: this.props.banner.backgroundcolor}}>
                    <div style={{display: 'inline-block', verticalAlign: 'top'}} className="navbar-brand">
                        {title}
                    </div>
                    <div style={{display: 'inline-block', verticalAlign: 'top'}}>
                        <ul>{linkList}</ul>
                    </div>
                </div>
            )
        } else {
            banner = <div className="navbar" style={{backgroundColor: 'rgba(0, 0, 0, 0)'}}></div>
        }
        let togglesettingsbutton;
        if(ENV.mode === 'view') {
            togglesettingsbutton = null;
        } else if(ENV.mode === 'create') {
            togglesettingsbutton = (<a
                onClick={this.hideOrShowSettings}
                style={{
                    verticalAlign: 'middle',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    marginRight: '6px',
                    minHeight: '41px',
                    lineHeight: '50px',
                    display: 'inline-block',
                    padding: '0 30px',
                    color: this.props.banner.backgroundcolor,
                    textAlign: 'center',
                    letterSpacing: '0.1rem',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    borderRadius: 0,
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    fontWeight: 500,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    zIndex: 10
                }}>settings &#9013;
            </a>);
        }

        let settings = null;
        if(this.state.settingsIsVisible) {
            settings = <DashboardHeaderEditor {...this.props}/>;
        }
        return (
            <div>
                {banner}
                {togglesettingsbutton}
                {settings}
            </div>
        )
    }
});

module.exports = DashboardHeader;
