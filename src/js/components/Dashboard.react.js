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
                rowItems.push(<Row key={i} plots={this.props.rows[i]} rowNumber={i} canRearrange={this.props.canRearrange}/>);
            }

            let header = null;
            let footer = null;
            if(ENV.mode === 'create' && rows[0].length > 0) {
                footer = (
                <div>
                    <hr/>
                    <div style={{textAlign: 'center', padding: '30px'}}>
                        <a id="generate" onClick={this.handleClick} className="button">publish dashboard</a>
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
