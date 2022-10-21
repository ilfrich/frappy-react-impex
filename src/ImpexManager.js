import React from "react"
import { util } from "quick-n-dirty-utils"
import { mixins, NotificationBar } from "quick-n-dirty-react"
import { DateTime } from "luxon"
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
                    return res.blob()
                } else {
                    throw Error("Invalid status code")
                }
            })
            .then(blob => {
                // download the zip file as blob
                const downloadUrl = URL.createObjectURL(blob)
                const a = document.createElement("a")
                const currentDate = DateTime.now().toFormat("yyyyMMdd_HHmmss")
                a.download = `export_${this.state.currentDatabaseExport}_${currentDate}.zip`
                a.href = downloadUrl
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
            })
            .catch(err => {
                console.error("Error downloading export zip file", err)
            })
    }

    importDatabase() {
        const file = this.importFile.files[0]
        const options = { truncate: this.truncateOption.checked }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("options", JSON.stringify(options))

        fetch(`${this.apiPrefix}/${this.state.currentDatabaseImport}`, {
            method: "POST",
            headers: util.getAuthHeader(),
            body: formData,
            
        })
            .then(util.restHandler)
            .then(result => {
                this.alert.success(`Imported ${result.count} documents into database`)
                // reset import file form
                this.importFile.value = ""
            })

    }

    render() {
        return (
            <div>
                <NotificationBar ref={el => { this.alert = el }} />
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
                        <DatabaseSelect databases={this.state.databases} onChange={this.setCurrentDatabaseImport} />
                        <div>
                            <label style={mixins.label}>Database Import File (.zip)</label>
                            <input type="file" ref={el => { this.importFile = el }} onChange={this.setImportFile} />
                        </div>
                        {this.state.importFile ? (
                            <div>
                                <div style={mixins.vSpacer(15)} />
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
            </div>
        )
    }
}

export default ImpexManager
