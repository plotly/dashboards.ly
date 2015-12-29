import React from 'react';
import AppActions from '../actions/AppActions';
import {Row, NewRowTarget} from './DashboardTargets.react';
import DashboardHeader from './DashboardHeader.react';

var Dashboard = React.createClass({
    propTypes: {
        rows: React.PropTypes.array.isRequired,
        canRearrange: React.PropTypes.bool.isRequired
    },

    handleClick: function (event) {
        AppActions.publishDashboard();
    },

    render: function() {
        let rows = this.props.rows;
        if(rows.length===0) {
            let divStyle = {
                'text-align': 'center'
            };
            return (<div className="container">
                <div style={divStyle}></div>
            </div>)
        } else {
            let rowItems = [];
            for(var i=0; i<rows.length; i++) {
                rowItems.push(<Row key={i} items={this.props.rows[i]} rowNumber={i} canRearrange={this.props.canRearrange}/>);
            }

            let header = null;
            let footer = null;
            if(ENV.mode === 'create' && rows[0].length > 0) {
                let showurl = null;
                if(this.props.publishUrl.length > 0) {
                    if(this.props.publishUrl.length === 1) {
                        showurl = (<div>
                            Dashboard URL: <a target="_blank" href={this.props.publishUrl}>{this.props.publishUrl}</a>
                        </div>)
                    } else {
                        let urllist = [];
                        for(var i=this.props.publishUrl.length-1; i>=0; i--) {
                            urllist.push(<div>
                                <a target="_blank" href={this.props.publishUrl[i]}>
                                    {this.props.publishUrl[i]}
                                </a>
                            </div>);
                        }

                        showurl = (<div>
                            Dashboard URLs
                            <div>
                                {urllist}
                            </div>
                        </div>);
                    }

                }
                footer = (
                <div>
                    <hr/>
                    <div style={{textAlign: 'center', padding: '30px'}}>
                        <a id="generate" onClick={this.handleClick} className="button">
                            {this.props.publishIsPending ? 'publishing': 'publish dashboard'}
                        </a>
                        {showurl}
                    </div>
                </div>);
            }
            if(rows[0].length > 0) {
                header = <DashboardHeader {...this.props}/>
            }

            let addNewRowTarget = null;
            if(ENV.mode === 'create' && this.props.canRearrange) {
                addNewRowTarget = <NewRowTarget/>;
            }

            return (
            <div>
                {header}
                <div style={{clear: 'both'}}></div>
                <div className="container">
                    {rowItems}
                    {addNewRowTarget}
                </div>
                <div style={{clear: 'both'}}></div>
                {footer}
            </div>);

        }
    }
});

module.exports = Dashboard;
