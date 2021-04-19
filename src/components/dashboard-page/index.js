import React from 'react'
import TileTitle from '../tile-title'
import Breadcrumbs from '../breadcrumbs'

import BarChartFill from 'react-bootstrap-icons/dist/icons/bar-chart-fill'
import CardList from 'react-bootstrap-icons/dist/icons/card-list'
import CodeSlash from 'react-bootstrap-icons/dist/icons/code-slash'
import { EventsPageBody } from '../events-page'

export default function DashboardPage() {
    return (
        <>
        <div className="container" style={{ flex: "auto", padding: "10px" }}>
            <div className="container">
                <div style={{ flex: "auto" }}>
                    <Breadcrumbs dashboard={true} elements={["Dashboard"]} />
                </div>
            </div>
            <div className="container" style={{ flexDirection: "row", flexWrap: "wrap", flex: "auto" }} >
                <div className="shadow-soft rounded tile" style={{ flex: "auto", flexGrow: "2", minWidth: "400px" }}>
                    <TileTitle name="Top Workflows">
                        <BarChartFill />
                    </TileTitle>
                </div>
                <div className="shadow-soft rounded tile" style={{ flex: "auto", flexGrow: "1", minWidth: "300px" }}>
                    <TileTitle name="Total Executions">
                        <CodeSlash />
                    </TileTitle>
                </div>
            </div>
            <div className="container" style={{ flexDirection: "row", flexWrap: "wrap", flex: "auto" }}>
                <div className="shadow-soft rounded tile" style={{ flex: "auto" }}>
                    <TileTitle name="Instances">
                        <CardList />
                    </TileTitle>
                    <EventsPageBody />
                </div>
            </div>
        </div>
        </>
    )
}