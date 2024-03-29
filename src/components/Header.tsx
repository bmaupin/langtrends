import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Icon, Menu, Popup } from 'semantic-ui-react';

import './Header.css';

export default function Header() {
  return (
    <Menu attached borderless inverted>
      <Container>
        <Menu.Item className="header-title" fitted="horizontally" header>
          {/* Wipe the search params to reset the chart back to the default state */}
          <Link to={{ search: '' }}>Programming language trends</Link>
        </Menu.Item>

        <Menu.Menu position="right">
          <Popup
            on="click"
            trigger={
              <Menu.Item icon>
                <Icon name="help circle" size="big" />
              </Menu.Item>
            }
            // This makes the content easier to read and prevents it from not showing on
            // smaller screens due to Popper's overflow detection
            // (https://popper.js.org/docs/v2/faq/#my-popper-is-bigger-than-the-viewport-what-do-i-do)
            wide={true}
          >
            <Popup.Content>
              <h3>How the data is calculated</h3>
              <p>
                First, a base numerical value for a given language and date is
                calculated by adding the total number of GitHub repositories to
                the total number of Stack Overflow tags for that language up to
                that day.
              </p>
              <h4>Fastest growth</h4>
              <p>
                Languages with the highest percentage change compared to the
                previous date. Note that scores under a{' '}
                <a href="https://github.com/bmaupin/langtrends-data/blob/96b8148cc525d129d11a7a2a357429afe0b6ee63/classes/settings.json#L3">
                  certain threshold
                </a>{' '}
                are filtered out to reduce{' '}
                <a href="https://xkcd.com/1102/">dubious claims</a>.
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
