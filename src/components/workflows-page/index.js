import React, { useEffect } from 'react'
import TileTitle from '../tile-title'
import Breadcrumbs from '../breadcrumbs'
import { useDropzone } from 'react-dropzone'

import YAML from "js-yaml"
import YAMLtoString from "yaml"

import { useCallback } from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import MainContext from '../../context'
import { useHistory } from 'react-router'
import { IoAddSharp, IoCloudUploadSharp, IoList, IoToggle, IoToggleOutline, IoTrash } from 'react-icons/io5'
import { sendNotification } from '../notifications'
import {NoResults} from '../../util-funcs'

import { ConfirmButton } from '../confirm-button'
import { validateName } from "../../util-funcs"


const noopState = `id: noop
description: ""
states:
    - id: helloworld
      type: noop
      transform: '{ result: "Hello world!" }'
`

export default function WorkflowsPage() {
    const { fetch, namespace, handleError } = useContext(MainContext)
    const history = useHistory()
    const [workflows, setWorkflows] = useState([])
    // const [forbidden, setForbidden] = useState(false)
    const [err, setErr] = useState("")
    const [actionErr, setActionErr] = useState("")


    const fetchWorkflows = useCallback(() => {
        // FIXME: This should stop bad fetches when namespace = <empty-string> before useContext 
        // populates the namespace value.
        // This is temp fix, this problem occurs on other components and can probably fixed globally
        // with changes to App.js
        if (!namespace) {
            return
        }
        async function fetchWfs() {
            try {
                // todo pagination
                let resp = await fetch(`/namespaces/${namespace}/workflows/?offset=0`, {
                    method: "get",
                })
                if (resp.ok) {
                    let json = await resp.json()
                    if (json.workflows) {
                        setWorkflows(json.workflows)
                    } else {
                        setWorkflows([])
                    }
                } else {
                    if(resp.status !== 403) {
                        await handleError('fetch workflows', resp)
                    } else {
                        setErr(`You are forbidden to list workflows for this namespace.`)
                    }
                }
            } catch (e) {
                setErr(`Failed to fetch workflows: ${e.message}`)
            }
        }
        fetchWfs()
    }, [namespace, fetch, handleError])

    const deleteWorkflow = async (id) => {
        try {
            let resp = await fetch(`/namespaces/${namespace}/workflows/${id}`, {
                method: "DELETE"
            })
            if (!resp.ok) {
                if(resp.status !== 403) {
                    await handleError('delete workflow', resp)
                } else {
                    setActionErr(`You are forbidden to delete workflow '${id}'.`)
                }
            }
            fetchWorkflows()
        } catch (e) {
            setActionErr(`Failed to delete workflow ${id}: ${e.message}`)
        }
    }

    const toggleWorkflow = async (id) => {
        try {
            let resp = await fetch(`/namespaces/${namespace}/workflows/${id}/toggle`, {
                method: "PUT",
            })
            if (!resp.ok) {
                if(resp.status !== 403) {
                    await handleError('toggle workflow', resp)                    
                } else {
                    setActionErr(`You are forbidden to toggle workflow '${id}'.`)
                }
            }
            fetchWorkflows()
        } catch (e) {
            setActionErr(`Failed to toggle workflow ${id}: ${e.message}`)
        }
    }

    useEffect(() => {
        fetchWorkflows()
    }, [fetchWorkflows])

    return (
        <>
            {namespace !== "" ?
                <div className="container" style={{ flex: "auto", padding: "10px" }}>
                    <div className="container">
                        <div style={{ flex: "auto" }}>
                            <Breadcrumbs elements={["Workflows"]} />
                        </div>
                    </div>
                    <div className="container" style={{ flexDirection: "row", flexWrap: "wrap", flex: "auto" }} >
                        <div className="shadow-soft rounded tile" style={{ flex: "auto", flexGrow: "4", minWidth: "400px" }}>
                            <TileTitle name="All workflows">
                                <IoList />
                            </TileTitle>

                            <div id="events-table" style={{ display: "flex", flexDirection: "column" }}>
                                {err ? 
                                    <div style={{ fontSize: "12px", paddingTop: "5px", paddingBottom: "5px", color: "red" }}>
                                    {err}
                                </div>
                                :
                                <>
                                {actionErr !== "" ?  <div style={{ fontSize: "12px", paddingTop: "5px", paddingBottom: "5px", color: "red" }}>
                            {err}
                        </div>
                                :""}
                                <>
                                {workflows.length > 0 ?
                                    <>
                                        {workflows.map(function (obj, i) {
                                            return (
                                                <div key={`workflow-item-${i}`} className="workflows-list-item" onClick={() => history.push(`/${namespace}/w/${obj.id}`)}>
                                                    <div className="workflows-list-name">
                                                        {obj.id}
                                                    </div>
                                                    <div className="workflows-list-description">
                                                        {obj.description === "" ? "No description has been provided." : obj.description}
                                                    </div>
                                                    <div style={{ flexGrow: "1", flexBasis: "0" }}>
                                                        <div className="actions-button-div">
                                                            {obj.active ?
                                                                <div className="button circle success" onClick={(ev) => {
                                                                    toggleWorkflow(obj.id)
                                                                    ev.stopPropagation()
                                                                }}>
                                                                    <span>
                                                                        <IoToggle />
                                                                    </span>
                                                                </div>
                                                                :
                                                                <div className="button circle" onClick={(ev) => {
                                                                    toggleWorkflow(obj.id)
                                                                    ev.stopPropagation()
                                                                }}>
                                                                    <span>
                                                                        <IoToggleOutline className={"toggled-switch"} />
                                                                    </span>
                                                                </div>
                                                            }
                                                            <ConfirmButton Icon={IoTrash} IconColor={"var(--danger-color)"} OnConfirm={(ev) => {
                                                                deleteWorkflow(obj.id)
                                                                ev.stopPropagation()
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </> :
                                    <NoResults />
                                }
                                </>
                                </>
}
                            </div>
                        </div>
                        <div className="container" style={{ flexWrap: "wrap", flex: "auto" }}>
                            <div className="shadow-soft rounded tile" style={{ minWidth: "350px" }}>
                                <TileTitle name="Upload workflow file">
                                    <IoCloudUploadSharp />
                                </TileTitle>
                                <UploadWorkflowForm />
                            </div>
                            <div className="shadow-soft rounded tile" style={{ minWidth: "350px" }}>
                                <TileTitle name="Create new workflow">
                                    <IoAddSharp />
                                </TileTitle>
                                <NewWorkflowForm />
                            </div>
                            <div className="shadow-soft rounded tile" style={{ minWidth: "350px" }}>
                                <TileTitle name="Send namespace event">
                                    <IoAddSharp />
                                </TileTitle>
                                <APIInteractionTile />
                            </div>
                        </div>
                    </div>
                </div>
                : ""}
        </>
    )
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (res) => {
            resolve(res.target.result)
        }

        reader.onerror = (err) => reject(err)
        reader.readAsText(file)
    })
}

function parseYaml(fetch, name, namespace, data, setErr, history) {
    const invalidNameErr = validateName(name, "workflow name")
    if (invalidNameErr) {
        setErr(`Name is invalid: ${invalidNameErr}`)
        return
    }

    try {
        let y = YAML.load(data, 'utf8')
        y.id = name
        createWorkflow(fetch, YAMLtoString.stringify(y), namespace, setErr, undefined, history)
    } catch (e) {
        setErr(`Unable to parse YAML: ${e.message}`)
    }
}

async function createWorkflow(fetch, data, namespace, setErr, setFiles, history, handleError) {
    try {
        let resp = await fetch(`/namespaces/${namespace}/workflows`, {
            headers: {
                "Content-Type": "text/yaml",
                "Content-Length": data.length,
            },
            method: "post",
            body: data,
        })
        if (resp.ok) {
            let json = await resp.json()
            if (setFiles) {
                setFiles([])
            }
            // setErr("")
            history.push(`/${namespace}/w/${json.id}`)
        } else {
            if (resp.status !== 403) {
                await handleError('create workflow', resp)
            } else {
                setErr("You are forbidden to upload a new workflow")
            }
        }
    } catch (e) {
        setErr(`Workflow creation failed: ${e.message}`)
    }
}

function APIInteractionTile() {

    const { fetch, namespace, handleError } = useContext(MainContext)

    const [val, setVal] = useState("")
    const [err, setErr] = useState("")

    async function sendEvent() {
        if (val !== "") {
            try {
                let resp = await fetch(`/namespaces/${namespace}/event`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: val
                })
                if (resp.ok) {
                    setVal("")
                    setErr("")
                } else {
                    if(resp.status !== 403) {
                        await handleError('send event', resp)
                    } else {
                        setErr("You are forbidden to send a cloud event to this namespace.")
                    }
                }
            } catch (e) {
                setErr(`Failed to send cloud event: ${e.message}`)
            }
        } else {
            setErr(`Send Cloud Event: Failed to send cloud event as input is empty`)
        }
        
    }


    return (
        <div>
            <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={13} style={{ width: "100%", height: "100%", resize: "none" }} />
            {err !== "" ?
                <div style={{ fontSize: "12px", paddingTop: "5px", paddingBottom: "5px", color: "red" }}>
                    {err}
                </div>
                :
                ""
            }
            <div style={{ textAlign: "right" }}>
                <input onClick={() => sendEvent()} type="submit" value="Submit" />
            </div>
        </div>
    )
}

function UploadWorkflowForm() {
    const { fetch, namespace, handleError } = useContext(MainContext)
    const history = useHistory()

    const [data, setData] = useState("")
    const [files, setFiles] = useState([])
    const [err, setErr] = useState("")

    return (
        <div>
            <div className="file-form">
                <Basic setErr={setErr} files={files} setFiles={setFiles} data={data} setData={setData} />
            </div>
            {err !== "" ?
                <div style={{ fontSize: "12px", paddingTop: "5px", paddingBottom: "5px", color: "red" }}>
                    {err}
                </div>
                :
                ""
            }
            <div style={{ textAlign: "right" }}>
                <input onClick={() => {
                    let invalidNameErr;
                    try {
                        // Check if file is a valid yaml
                        const y = YAML.load(data, 'utf8')
                        invalidNameErr = validateName(y.id, "id")
                    } catch (e) {
                        setErr(`File is not a valid: ${e.reason}`)
                        return
                    }

                    // Check if id is a valid name
                    if (invalidNameErr) {
                        setErr(`Invalid workflow: ID: ${invalidNameErr}`)
                    } else {
                        createWorkflow(fetch, data, namespace, setErr, setFiles, history, handleError)
                    }
                }} type="submit" value="Submit" />
            </div>
        </div>
    )
}

function NewWorkflowForm() {

    const { fetch, namespace, handleError } = useContext(MainContext)
    const history = useHistory()

    const [name, setName] = useState("")
    const [template, setTemplate] = useState("")
    const [templates, setTemplates] = useState([])
    const [templateData, setTemplateData] = useState("")
    const [err, setErr] = useState("")

    const fetchTempData = useCallback((temp, setData) => {
        async function fetchd() {
            if(temp !== "default-noop"){
                try {
                    let resp = await fetch(`/workflow-templates/default/${temp}`, {
                        method: "GET"
                    })
                    if (resp.ok) {
                        let text = await resp.text()
                        setData(text)
                    } else {
                        if(resp.status !== 403) {
                            await handleError('fetch template', resp)
                        } else {
                            setErr(`You are forbidden to fetch the template data`)
                        }
                    }
                } catch (e) {
                    setErr(`Failed to fetch template data: ${e.message}`)
                }
            } else {
                setTemplateData(noopState)
            }
        }
        fetchd()
    }, [fetch, handleError])

    const fetchTemps = useCallback((load) => {
        async function fetchTemplates() {
            try {
                let resp = await fetch(`/workflow-templates/default/`, {
                    method: "GET"
                })
                if (resp.ok) {
                    let json = await resp.json()
                    if(load){
                        setTemplate("default-noop")
                        setTemplateData(noopState)
                        setTemplates(json)
                    }
                } else {
                    if(resp.status !== 403) {
                        await handleError('fetch templates', resp)
                    } else {
                        // set default template
                        setTemplate("default-noop")
                        setTemplateData(noopState)
                        setErr(`You are forbidden to fetch a list of templates`)
                    }
                }
            } catch (e) {
                setErr(`Failed to fetch a list of templates: ${e.message}`)
            }
        }
        fetchTemplates()
    }, [fetch, handleError])

    useEffect(() => {
        fetchTemps(true)
    }, [fetchTemps])

    return (
        <div style={{ fontSize: "12pt" }}>
            <table>
                <tbody>
                    <tr>
                        <td style={{ textAlign: "left" }}>
                            <b>Name:</b>
                        </td>
                        <td style={{ paddingLeft: "10px", textAlign: "left" }}>
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Workflow name" />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: "left" }}>
                            <b>Template:</b>
                        </td>
                        <td style={{ paddingLeft: "10px", textAlign: "left" }}>
                            <select value={template} onChange={(e) => {
                                setTemplate(e.target.value)
                                fetchTempData(e.target.value, setTemplateData)
                            }}>
                                <option key="default-noop">default-noop</option>
                                {
                                    templates.map((obj) => <option key={obj} value={obj}>{obj}</option>)
                                }
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="divider-dark" />
            <div>
                <div style={{ textAlign: "left", fontSize: "10pt" }}>
                    <span>
                        Template Preview
                    </span>
                </div>
                <div style={{ marginTop: "10px", backgroundColor: "#252525", borderRadius: "4px", padding: "10px" }}>
                    <code style={{ textAlign: "left", maxWidth: "400px" }}>
                        <pre style={{ maxWidth: "400px", minWidth: "400px" }}>
                            {templateData}
                        </pre>
                    </code>
                </div>
            </div>
            <div className="divider-dark" />
            {
                err !== "" ?
                    <div style={{ fontSize: "12px", paddingTop: "5px", paddingBottom: "5px", color: "red" }}>
                        {err}
                    </div>
                    :
                    ""
            }
            <div style={{ textAlign: "right" }}>
                <input type="submit" value="Submit" onClick={() => { parseYaml(fetch, name, namespace, templateData, setErr, history) }} />
            </div>
        </div>
    )
}

function Basic(props) {
    const { setData, files, setFiles, setErr } = props

    const onDrop = useCallback(
        async (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                setErr(`Invalid File: File: '${fileRejections[0].file.name}' is not supported, ${fileRejections[0].errors[0].message}`)
            } else {
                setData(await readFile(acceptedFiles[0]))
                setFiles([...acceptedFiles]);
            }
        },
        [setData, setFiles]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "application/x-yaml, .yaml, .yml",
        maxFiles: 1,
        multiple: false
    });

    return (
        <section className="container">
            <div {...getRootProps({ className: 'dropzone' })} style={{ cursor: "pointer" }}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop a file here, or click to select file</p>
                <aside style={{ minHeight: "32px", textAlign: "center" }}>
                    <ul>
                        {
                            files.map((file) => <li key={file.path}>{file.path} - {file.size} bytes</li>)
                        }
                    </ul>
                </aside>
            </div>
        </section>
    );
}