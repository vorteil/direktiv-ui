export async function Namespaces(fetch, handleError, load, val) {
    try {
        let newNamespace = ""
        let namespaces = []
        let resp = await fetch(`/namespaces`, {})

        if(resp.ok) {
            let json = await resp.json() 

            // if edges exists means theres namespaces to look at
            if(json.edges){
                // if its the first load
                if(load) {
                    // check routes that dont have a namespace attached
                    if(window.location.pathname !== "/jq/playground" && window.location.pathname.includes("/global/functions")) {
                        if (window.location.pathname.split("/")[2] !== "") {
                            newNamespace = window.location.pathname.split("/")[2]
                        }

                        let f = false
                        for (let i=0; i < json.edges.length; i++) {
                            if(json.edges[i].node.name === newNamespace) {
                                f = true
                            }
                        }

                        if(!f) {
                            window.location.pathname = "/"
                            return
                        }
                    }

                    if(newNamespace === ""){
                        if (localStorage.getItem("namespace") !== undefined && localStorage.getItem("namespace") === "") {
                            if(json.edges.length > 0) {
                                newNamespace = json.edges[0].node.name
                            }
                        } else {
                            let found = false
                            for (let i=0; i < json.edges.length; i++) {
                                if(json.edges[i] !== null && json.edges[i].node.name === localStorage.getItem("namespace")) {
                                    found = true
                                    newNamespace = localStorage.getItem("namespace")
                                    break
                                }
                            }
                            if(!found && json.edges.length > 0) {
                                newNamespace = json.edges[0].node.name
                                localStorage.setItem("namespace", json.edges[0].node.name)
                            } 
                        }
                    }
                }

                if (newNamespace === "" && val) {
                    newNamespace = val
                }
                for (let i=0; i < json.edges.length; i++) {
                    namespaces.push(json.edges[i].node.name)
                }
            }
            return {
                namespaces: namespaces,
                namespace: newNamespace
            }
        } else {
            await handleError('fetching namespaces', resp, "listNamespaces")
        }
    } catch(e) {
        throw new Error(`${e.message}`)
    }
}

export async function NamespaceCreate(fetch, handleError, val) {
    try {
        let resp = await fetch(`/namespaces`, {
            method: "POST",
            body: JSON.stringify({
                name: val
            })
        })
        if(resp.ok) {
            return val
        } else {
            await handleError('create namespace', resp, 'addNamespace')
        }
    } catch(e) {
        throw new Error(`${e.message}`)
    }
}

export async function NamespaceDelete(fetch, namespace, handleError) {
    try {
        let resp = await fetch(`/namespaces/${namespace}`,{
            method:"DELETE"
        })
        if(resp.ok) {
            return
        } else {
            await handleError('delete namespace', resp, "deleteNamespace")
        }
    } catch(e) {
        throw new Error(`${e.message}`)
    }
}

export async function NamespaceInstances(fetch, namespace, handleError) {
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/instances`,{})
        if(resp.ok) {
            let json = await resp.json()
            return json.instances.edges
        } else {
            await handleError('list instances', resp, 'listInstances')
        }
    } catch(e) {
        throw new Error(`Failed to list instances: ${e.message}`)
    }
}

export async function NamespaceLogs(fetch, namespace, handleError, endCursor) {
    try {
        let uri = `/namespaces/${namespace}/logs`
        if(endCursor !== "") {
            uri += `?pagination.after=${endCursor}`
        }
        let resp = await fetch(uri, {})
        if(resp.ok) {
            let json = await resp.json()
            return json
        } else {
            await handleError('fetch namespace logs', resp, 'getNamespaceLogs')
        }
    } catch(e) {
        throw new Error(`Error: ${e.message}`)
    }
}

export async function NamespaceSecrets(fetch, namespace, handleError) {
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/secrets`,{})
        if(resp.ok) {
            let json = await resp.json()
            if (Array.isArray(json.secrets.edges)){
                if(json.secrets.edges.length > 0) {
                    return json.secrets.edges
                }
            } else {
                return []
            }
        } else {
            await handleError('fetch secrets', resp, 'listSecrets')
        }
    } catch(e) {
        throw new Error(`Failed to fetch secrets: ${e.message}`)
    }
}

export async function NamespaceRegistries(fetch, namespace, handleError) {
    try {
        let resp = await fetch(`/functions/namespaces/${namespace}/registries`,{})
        if(resp.ok) {
            let json = await resp.json()
            if (Array.isArray(json.registries.edges)) {
                if(json.registries.edges.length > 0) {
                   return json.registries.edges
                }
            } 
            return []
        } else {
            await handleError('fetch registries', resp, 'listRegistries')
        }
    } catch(e) {
        throw new Error(`Failed to fetch registries: ${e.message}`)
    }
}

export async function NamespaceCreateSecret(fetch, namespace, key, value, handleError) {
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/secrets`,{
            method: "POST",
            body: JSON.stringify({ namespace: namespace, key: key, data: value})
        })
        if(resp.ok){
            return
        } else {
            await handleError('create secret', resp, 'createSecret')
        }
    } catch(e) {
        throw new Error(`Failed to create secret: ${e.message}`)
    }
}

export async function NamespaceCreateRegistry(fetch, namespace, key,val, handleError) {
    try {
        let resp = await fetch(`/functions/namespaces/${namespace}/registries`, {
            method: "POST",
            body: JSON.stringify({key: key, namespace: namespace, data:val})
        })
        if(resp.ok){
            return
        } else {
            await handleError('create registry', resp, 'createRegistry')
        }
    } catch(e) {
        throw new Error(`Failed to create registry: ${e.message}`)
    }
}

export async function NamespaceDeleteSecret(fetch, namespace, val, handleError){
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/secrets`, {
            method: "DELETE",
            body: JSON.stringify({ key: val, namespace: namespace })
        })
        if (resp.ok) {
            return 
        } else {
            await handleError('delete secret', resp, 'deleteSecret')
        }
    } catch (e) {
        throw new Error(`Failed to delete secret: ${e.message}`)
    }
}

export async function NamespaceDeleteRegistry(fetch, namespace, key, handleError) {
    try {
        let resp = await fetch(`/namespaces/${namespace}/registries`, {
            method: "DELETE",
            body: JSON.stringify({ key: key })
        })
        if (resp.ok) {
            return 
        } else {
            await handleError('delete registry', resp, 'deleteRegistry')
        }
    } catch (e) {
        throw new Error(`Failed to delete registry: ${e.message}`)
    }
}

export async function NamespaceVariables(fetch, namespace, handleError) {
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/namespace-variables`,{
            method: "GET"
        })
        if(resp.ok) {
            let json = await resp.json()
            if(Array.isArray(json.variables.edges)){
                if(json.variables.edges.length > 0) {
                    return json.variables.edges
                }
            }
            return []
        } else {
            await handleError('fetch variables', resp, 'getVariables')
        }
    } catch(e) {
        throw new Error(`Failed to fetch variables: ${e.message}`)
    }
}

export async function NamespaceSetVariable(fetch, namespace, name, val, handleError) {
    try {
        let resp = await fetch(`/vars/namespaces/${namespace}/vars/${name}`, {
            method: "PUT",
            body: val
        })
        if (resp.ok) {
            return true
        } else {
            await handleError('set variable', resp, 'getVariables')
        }
    } catch(e) {
        throw new Error(`Failed to set variable: ${e.message}`)
    }
}

export async function NamespaceDeleteVariable(fetch, namespace, name, handleError) {
    try {
        let resp = await fetch(`/flow/namespaces/${namespace}/namespace-variables/${name}`,{
            method: "DELETE"
        })
        if(resp.ok) {
            return
        } else {
            await handleError('delete variable', resp, 'getVariables')
        }
    } catch(e) {
        throw new Error(`Failed to delete variable: ${e.message}`)
    }
}

export async function NamespaceGetVariable(fetch, namespace, name, handleError) {
    try {
        let resp = await fetch(`/vars/namespaces/${namespace}/vars/${name}`, {})
        if(resp.ok) {
            return await resp.text()
        } else {
            await handleError('get variable', resp, 'getVariables')
        }
    } catch(e) {
        throw new Error(`Failed to get variable: ${e.message}`)
    }
}


export async function NamespaceDownloadVariable(fetch, namespace, name, handleError) {
    try {
        let resp = await fetch(`/vars/namespaces/${namespace}/vars/${name}`, {})
        if(resp.ok) {
            return {
               contentType: resp.headers.get("content-type"),
               blob: await resp.blob()
            }
        } else {
            await handleError('get variable', resp, 'getVariables')
        }
    } catch(e) {
        throw new Error(`Failed to get variable: ${e.message}`)
    }
}

export async function NamespaceTree(fetch, namespace, path, children, handleError) {
    try {
        let uri = `/namespaces/${namespace}/tree`
        if(path[0]) {
            uri += `/${path[0]}`
        }
        let resp = await fetch(`${uri}/`, {})
        if(resp.ok) {
            let json = await resp.json()
            if(children) {
                if(json.children && json.children.edges.length > 0) {
                    return {
                        list: json.children.edges,
                        pageInfo: json.children.pageInfo
                    }
                } else {
                    return {
                        list: [],
                        pageInfo: null
                    }
                }
            } else {
                return json.node.type
            }
        } else {
            await handleError(`fetch details on ${path[0]}`, resp, "TODO PERM")
        }
    } catch(e) {
        throw new Error(e.message)
    }
}

export async function NamespaceCreateNode(fetch, namespace, path, dir, type, data, handleError) {
    try {
        let uriPath = `/namespaces/${namespace}/tree`
        if(path) {
            uriPath += `/${path}`
        }
        let body = {
            type: type
        }
        if(type === "workflow") {
            body = data
            dir += "?op=create-workflow"
        } else {
            dir += "?op=create-directory"
            body = JSON.stringify(body)
        }
        let resp = await fetch(`${uriPath}/${dir}`, {
            method: "PUT",
            body: body
        })
        if(resp.ok) {
            return true
        } else {
            // TODO what permission we giving this?
            await handleError('create node', resp, "TODO")
        }
    } catch(e) {
        throw new Error(e.message)
    }
}

export async function NamespaceDeleteNode(fetch, namespace, path, name, handleError) {
    try {
        let uriPath = `/namespaces/${namespace}/tree`
        if(path) {
            uriPath += `/${path}`
        }
        let resp = await fetch(`${uriPath}/${name}?op=delete-node`, {
            method: "DELETE"
        })
        if(resp.ok){
            return true
        } else {
            await handleError('delete node', resp, "TODO")
        }
    } catch(e) {
        throw new Error(e.message)
    }
}