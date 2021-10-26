[![CI](https://github.com/bmaupin/langtrends/workflows/CI/badge.svg)](https://github.com/bmaupin/langtrends/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/bmaupin/langtrends/blob/master/LICENSE)

---

#### About

Simple charts showing programming language trends

- Data is from [https://github.com/bmaupin/langtrends-data](https://github.com/bmaupin/langtrends-data)
- Data is updated monthly

#### Built with

- [React](https://reactjs.org/)
- [Semantic UI](https://react.semantic-ui.com/)
- [react-vis](https://uber.github.io/react-vis/)
- [github-colors](https://github.com/IonicaBizau/github-colors)

#### Development

1. (Optional) Host the data locally

   1. Check out [https://github.com/bmaupin/langtrends-data](https://github.com/bmaupin/langtrends-data)

   1. Run `npm run dev` in that project

1. Create `.env.development` file and set `REACT_APP_API_BASE_URL`

   - Use local data:

     `REACT_APP_API_BASE_URL='http://localhost:4000'`

   - Or use the data hosted on GitHub

     `REACT_APP_API_BASE_URL='https://bmaupin.github.io/langtrends-data/data'`

1. Run this app

   ```
   npm install
   npm run dev
   ```

#### Deploying

1. Create `.env.production` file and set `REACT_APP_API_BASE_URL`

1. Deploy

   ```
   npm run deploy
   ```
