import React, { FunctionComponent } from 'react'

const ErrorMessage: FunctionComponent<{readonly message: string}> = props =>
  <div className="error-message">{props.message}</div>

export default ErrorMessage
