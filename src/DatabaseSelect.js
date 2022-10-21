import React from "react"
import { mixins } from "quick-n-dirty-react"


const DatabaseSelect = ({ onChange, databases }) => (
    <div>
        <label style={mixins.label}>Database/Collection</label>
        <select style={mixins.dropdown} onChange={onChange}>
            <option value="">Please select database</option>
            {Object.keys(databases).map(dbKey => (
                <option key={dbKey} value={dbKey}>
                    {databases[dbKey][0] (databases[dbKey][1])}
                </option>
            ))}
        </select>
    </div>
)

export default DatabaseSelect
