import React, { FunctionComponent } from 'react'

interface Props {
  readonly className?: string
}

const Popup: FunctionComponent<Props> = props =>
  <div className={'popup ' + props.className}>
    <section className='content'>{props.children}</section>
  </div>

export default Popup
