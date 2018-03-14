import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'

export default class ChartTopMenu extends Component {
  state = { activeItem: 'top' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state

    return (
      <Menu secondary>
        <Menu.Item name='top' active={activeItem === 'top'} onClick={this.handleItemClick} />
        <Menu.Item name='fastest growing' active={activeItem === 'fastest growing'} onClick={this.handleItemClick} />
      </Menu>
    )
  }
}