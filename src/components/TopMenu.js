import React, { Component } from 'react'
import { Container, Icon, Menu } from 'semantic-ui-react'

export default class TopMenu extends Component {
  render() {
    return (
      <Menu attached borderless inverted>
        <Container>
          <Menu.Item fitted='horizontally' header>
            Programming language popularity contest
          </Menu.Item>

          {/* TODO: add link to github */}
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
