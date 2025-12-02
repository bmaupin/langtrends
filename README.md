[![CI](https://github.com/bmaupin/langtrends/workflows/CI/badge.svg)](https://github.com/bmaupin/langtrends/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/bmaupin/langtrends/blob/master/LICENSE)

---

## About

Simple charts showing programming language trends

- Data is from GitHub and Stack Overflow via [https://github.com/bmaupin/langtrends-data](https://github.com/bmaupin/langtrends-data)
- Data is updated monthly

#### Why?

I like to keep up with programming languages and see how their adoption is changing over time. Unfortunately I wasn't happy with many of the existing sites for a number of reasons:

- Most sites include markup/data formats (HTML, JSON, etc) and domain-specific languages (SQL, MATLAB, Bash, etc), but I wanted a comparison of general-purpose programming languages
- Some sites have odd ways of gathering data that result in questionable rankings; for example, [TIOBE](https://www.tiobe.com/tiobe-index/) ranked Groovy as the #10 language in January 2021
- Sites that do have nicer rankings are often only updated quarterly ([GitHub's Innovation Graph](https://innovationgraph.github.com/), [RedMonk](https://redmonk.com/sogrady/category/programming-languages/), [GitHut 2.0](https://madnight.github.io/githut/))
- [RedMonk](https://redmonk.com/sogrady/category/programming-languages/) has a nice visualization but it only reflects one point in time and doesn't show changes over time
- [GitHut](https://githut.info/) hasn't been updated since 2014

Having said that, many of those sites have specific advantages over this project:

- [TIOBE](https://www.tiobe.com/tiobe-index/) and [RedMonk](https://redmonk.com/sogrady/category/programming-languages/) both offer additional analysis on the data
- [GitHub's Innovation Graph](https://innovationgraph.github.com/), [GitHut](https://githut.info/) and [GitHut 2.0](https://madnight.github.io/githut/) have data for multiple GitHub metrics, such as pushes, issues, etc

This project has also been a place for me to learn or refresh my knowledge on specific technologies (React, TypeScript, [sql.js-httpvfs](https://github.com/bmaupin/langtrends-data/tree/store-data-in-sqlite), [LoopBack](https://github.com/bmaupin/langtrends-api), [Grails](https://github.com/bmaupin/junkpile/tree/main/groovy/grails-test), etc)

#### Built with

- [React](https://reactjs.org/)
- [Semantic UI](https://react.semantic-ui.com/)
- [react-charts](https://github.com/tannerlinsley/react-charts)
- [github-colors](https://github.com/IonicaBizau/github-colors)

## Development

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
