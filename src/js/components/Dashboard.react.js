import React from 'react';
import AppActions from '../actions/AppActions';
import {Row, NewRowTarget} from './DashboardTargets.react';

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
                rowItems.push(<Row plots={this.props.rows[i]} rowNumber={i} canRearrange={this.props.canRearrange}/>);
            }

            let footer = null;
            if(ENV.mode === 'create' && rows[0].length > 0) {
                footer = (<div style={{textAlign: 'center', padding: '30px'}}>
                    <a id="generate" onClick={this.handleClick} className="button">publish dashboard</a>
                </div>);
            }

            let addNewRowTarget = null;
            if(ENV.mode === 'create' && this.props.canRearrange) {
                addNewRowTarget = <NewRowTarget></NewRowTarget>;
            }

            return (
                <div>
                    <div style={{boxShadow: '0 0 12px 1px rgba(87,87,87,0.2)', backgroundColor: 'f9f9f9'}} className="container">
                        {rowItems}
                        {addNewRowTarget}
                    </div>
                    {footer}
            </div>);
        }
    }
});

module.exports = Dashboard;
