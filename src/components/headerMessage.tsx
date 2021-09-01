import React, { FunctionComponent } from 'react'

const HeaderMessage: FunctionComponent<{readonly title: string}> = props =>
  <h1 className="header-message">{props.title}</h1>

export default HeaderMessage
