import React, { useContext, useState,  useEffect } from 'react'
import MainContext from '@vorteil/direktiv-ui.context'
import { useParams } from 'react-router'
import {sendNotification} from '@vorteil/direktiv-ui.notifications'
import PieChart from '@vorteil/direktiv-ui.pie'
import TileTitle from '@vorteil/direktiv-ui.tile-title'
import Breadcrumbs from '@vorteil/direktiv-ui.breadcrumbs'

import { IoCodeSlashOutline, IoEllipse, IoList } from 'react-icons/io5'
import {EventsPageBody} from '@vorteil/direktiv-ui.events-page'

export default function DashboardPage() {
    // const [instances, setInstances] = useState(null)
    const [metrics, setMetrics] = useState(null)
    const {fetch, namespace} = useContext(MainContext)
    const params = useParams()


    useEffect(()=>{
        async function fetchMet() {
            let pieColors = {
                complete: "#2fa64d",
                failed: "#db3447",
                pending: "#ffbf32",
                crashed: "#4a4e4e"
            }
            try {
                let resp = await fetch(`/instances/${params.namespace}`, {
                    method: "GET"
                })
                if (resp.ok) {
                    let json = await resp.json()

                    let statusMap = {};
                    if (json.workflowInstances) {
                        for(let x=0; x < json.workflowInstances.length; x++) {
                            if(!statusMap[json.workflowInstances[x].status]) {
                                statusMap[json.workflowInstances[x].status] = 0
                            }
                            statusMap[json.workflowInstances[x].status] += 1
                        }
                    }
                    let data = [];
                    
                    Object.keys(statusMap).forEach(function(k, v) {
                        data.push({
                            title: k,
                            value: statusMap[k],
                            color: pieColors[k]
                        })
                    })

                    // setInstances(json)
                    setMetrics(data)
                } else {
                   // 400 should have json response
                    if(resp.status === 400) {
                        let json = await resp.json()
                        throw new Error(json.Message)
                    } else {
                        throw new Error(`response code was ${resp.status}`)
                    }
                }
            } catch(e) {
                sendNotification(`Failed to fetch metrics for workflow`, e.message, 0)
            }
        }
        if(metrics === null && namespace !== "") {
            fetchMet()
        }
    },[fetch, params.workflow, metrics, params.namespace, namespace])


    return (
        <>
        {namespace !== "" ?
        <div className="container" style={{ flex: "auto", padding: "10px" }}>
            <div className="container">
                <div style={{ flex: "auto" }}>
                    <Breadcrumbs dashboard={true} elements={["Dashboard"]} />
                </div>
            </div>
            <div className="container" style={{ flexDirection: "row", flexWrap: "wrap", flex: "auto" }} >
                {/* <div className="shadow-soft rounded tile" style={{ flex: "auto", flexGrow: "2", minWidth: "300px", maxHeight: "400px"}}>
                    <TileTitle name="Top Workflows">
                        <IoBarChartSharp />
                    </TileTitle>
                    <TopWorkflows instances={instances} />
                </div> */}
                <div className="shadow-soft rounded tile" style={{ flex: "auto", minWidth: "300px", maxWidth: "400px", maxHeight: "400px" }}>
                    <TileTitle name="Recent Workflows">
                        <IoCodeSlashOutline />
                    </TileTitle>
                    <DashboardTotalExecutions metrics={metrics} />
                </div>
                <div className="shadow-soft rounded tile" style={{ flex: "auto", flexGrow: "1", maxHeight: "400px" }}>
                    <TileTitle name="Events">
                        <IoList />
                    </TileTitle>
                    <EventsPageBody />
                </div>
            </div>
            <div className="container" style={{ flexDirection: "row", flexWrap: "wrap", flex: "auto" }}>
            </div>
        </div>
        :
    
    ""}
        </>
    )
}


function DashboardTotalExecutions(props) {

    let { metrics } = props;

    if (metrics && metrics.length > 0) {


        return (
            <div>
                <PieComponent metrics={metrics} />
                <div className="container" style={{ justifyContent: "center", flexDirection: "row", marginTop: "20px", alignItems: "center", fontSize: "10pt", flexWrap: "wrap" }}>
                  {        metrics.map((obj, i) => {
            return(<div className="shadow-soft tile" key={i} style={{ display: "flex", maxWidth: "150px", borderRadius: ".55rem" }} >
                <div style={{ marginRight: "5px", display: "flex", flexDirection: "row", alignItems: "center" }}>
                    <IoEllipse className={obj.title} style={{ marginTop: "2px", marginRight: "5px" }} />
                    <span>
                        {obj.title}
                    </span>
                </div>
                <div>
                    ({obj.value})
                </div>
            </div>)
        })}
                </div>
            </div>
        )
    } 

    return (
        <div className="container" style={{ fontSize: "11pt", height: "80%", flexDirection: "column", alignItems: "center" }}>
            <div>
                No workflows have been executed recently!
            </div>
        </div>
    )
}

function PieComponent(props) {

    let { metrics } = props;

    if (metrics === null) {
        return ""
    }
    
    return(
        <PieChart lineWidth={40} data={metrics} />
    )
}