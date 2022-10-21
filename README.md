# React Database Import/Export Module

React Component to Facilitate Database Import/Export Functionality

This package is a counterpart to the following server-side package and uses the endpoints provided 
 by those packages:

- [`frappyflaskimpex`](https://github.com/ilfrich/frappy-flask-impex) (Python)

## Usage

```javascript
import React from "react"
import { Switch, Route } from "react-route"
import { ImpexManager } from "@frappy/react-impex"

const RouterComponent = props => (
    <Switch>
        <Route path="/admin/impex" exact component={() => <ImpexManager />} />
        ... other routes
    </Switch>
)
```

**Properties**

- `apiPrefix` - default `/api/impex` - the endpoint used by the server-side component to register 
 the endpoints
