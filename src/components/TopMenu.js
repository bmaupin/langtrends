import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { Icon } from 'semantic-ui-react'
import { Image } from 'semantic-ui-react'
import { Menu } from 'semantic-ui-react'

export default class TopMenu extends Component {
  render() {
    return (
      <Menu attached borderless inverted>
        <Container>
          <Menu.Item header>
            <Icon size='large'>
              <Image src='popcorn.svg' fluid />
            </Icon>
            PopCon
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item>
              <Icon name='github' size='big' />
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    )
  }
}
