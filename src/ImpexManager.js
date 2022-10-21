import React from "react"
import { util } from "quick-n-dirty-utils"
import { mixins } from "quick-n-dirty-react"
import DatabaseSelect from "./DatabaseSelect"

const style = {
    gridColumns: {
        display: "grid",
        gridTemplateColumns: "300px 300px",
        gridColumnGap: "20px",
    }
}

class ImpexManager extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            databases: {},  // key > [class name, doc count]
            currentDatabaseExport: null,
            currentDatabaseImport: null,
            importFile: null,
        }

        this.setCurrentDatabaseExport = this.setCurrentDatabaseExport.bind(this)
        this.setCurrentDatabaseImport = this.setCurrentDatabaseImport.bind(this)
        this.setImportFile = this.setImportFile.bind(this)
        this.exportDatabase = this.exportDatabase.bind(this)
        this.importDatabase = this.importDatabase.bind(this)

        this.apiPrefix = this.props.apiPrefix || "/api/impex"
    }

    componentDidMount() {
        fetch(this.apiPrefix, {
            headers: util.getAuthJsonHeader(),
        })
            .then(util.restHandler)
            .then(databases => {
                this.setState({ databases })
            })
    }

    setCurrentDatabaseExport(ev) {
        const val = ev.target.value
        if (val === "") {
            this.setState({ currentDatabaseExport: null })
            return
        }
        this.setState({ currentDatabaseExport: val })
    }

    setCurrentDatabaseImport(ev) {
        const val = ev.target.value
        if (val === "") {
            this.setState({ currentDatabaseImport: null })
            return
        }
        this.setState({ currentDatabaseImport: val })
    }

    setImportFile(ev) {
        const val = ev.target.value
        if (val === "") {
            this.setState({ importFile: null })
            return
        }
        this.setState({ importFile: true })
    }

    exportDatabase() {
        fetch(`${this.apiPrefix}/${this.state.currentDatabaseExport}`, {
            headers: util.getAuthJsonHeader(),
        })
            .then(res => {
                if (res.status === 200) {
                    // download the zip file as blob
                    const blob = new Blob([res], { type: "application/gzip" })
                    const downloadUrl = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = downloadUrl
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                } else {
                    throw Error("Invalid status code")
                }
            })
            .catch(err => {
                console.error("Error downloading export zip file", err)
            })
    }

    importDatabase() {
        const file = this.importFile.files[0]
        const body = { truncate: this.truncateOption.checked }
    }

    render() {
        return (
            <div style={style.gridColumns}>
                <div>
                    <h5>Export</h5>
                    <DatabaseSelect databases={this.state.databases} onChange={this.setCurrentDatabaseExport} />
                    {this.state.currentDatabaseExport != null ? (
                        <div style={mixins.buttonLine}>
                            <button style={mixins.button} onClick={this.exportDatabase} type="button">Run Export</button>
                        </div>
                    ) : null}
                </div>
                <div>
                    <h5>Import</h5>
                    <div>
                        <label style={mixins.label}>Database Import File (.zip)</label>
                        <input type="file" ref={el => { this.importFile = el }} onChange={this.setImportFile} />
                    </div>
                    {this.state.importFile ? (
                        <div>
                            <DatabaseSelect databases={this.state.databases} onChange={this.setCurrentDatabaseImport} />
                            <div>
                                <input type="checkbox" style={mixins.checkbox} ref={el => {this.truncateOption = el }} defaultChecked id="import-truncate-option" />
                                <label htmlFor="import-truncate-option">Truncate database before import</label>
                            </div>
                            {this.state.currentDatabaseImport != null ? (
                                <div style={mixins.buttonLine}>
                                    <button style={mixins.button} onClick={this.importDatabase} type="button">Run Import</button>
                                </div>
                            ) : null}                            
                        </div>
                    ) : null}
                </div>
            </div>
        )
    }
}

export default ImpexManager
