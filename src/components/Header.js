import React, { Component } from 'react';
import { Container, Icon, Menu } from 'semantic-ui-react';

export default class Header extends Component {
  render() {
    return (
      <Menu attached borderless inverted>
        <Container>
          <Menu.Item fitted='horizontally' header>
            Programming language trends
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item href='https://github.com/bmaupin/langtrends' icon>
              <Icon name='github' size='big' />
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}
