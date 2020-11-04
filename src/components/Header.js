import React, { Component } from 'react';
import { Container, Icon, Menu, Popup } from 'semantic-ui-react';

export default class Header extends Component {
  render() {
    return (
      <Menu attached borderless inverted>
        <Container>
          <Menu.Item fitted="horizontally" header>
            Programming language trends
          </Menu.Item>

          <Menu.Menu position="right">
            <Popup
              on="click"
              trigger={
                <Menu.Item icon>
                  <Icon name="help circle" size="big" />
                </Menu.Item>
              }
            >
              <Popup.Content>
                <h3>How the data is calculated</h3>
                <p>
                  First, a base numerical value for a given language and date is
                  calculated by adding the total number of GitHub repositories
                  to the total number of Stack Overflow tags for that language
                  up to that day.
                </p>
                <h4>Fastest growth</h4>
                <p>
                  Languages with the highest percentage change compared to the
                  previous date. Note that scores under a{' '}
                  <a href="https://github.com/bmaupin/langtrends/blob/master/src/settings.json#L2">
                    certain threshold
                  </a>{' '}
                  are filtered out to reduce{' '}
                  <a href="https://xkcd.com/1102/">dubiousness</a>.
                </p>
                <h4>Most growth</h4>
                <p>
                  Languages with the highest numerical change compared to the
                  previous date.
                </p>
                <h4>Top</h4>
                <p>
                  Languages with the total highest value for a particular given
                  date.
                </p>
              </Popup.Content>
            </Popup>
            <Menu.Item href="https://github.com/bmaupin/langtrends" icon>
              <Icon name="github" size="big" />
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}
