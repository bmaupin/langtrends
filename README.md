### To do
- [x] Convert fastest growing languages to basic bump chart
    - [x] Get basic bump chart working
    - [x] Show actual percent change in crosshair items?
- [ ] Better bump chart
    - [x] Instead of calculating fastest growing languages for current month (with null where that language has no score for that month), calculate it newly for every month
        - Otherwise, the chart is deceptive. For example, Swift doesn't even show up unless it was the fastest growing for the latest interval...
    - [ ] Visual improvements: add points (LineMarkSeries), curved lines, hover over individual values (instead of column), better legend
        - See: https://www.kevinflerlage.com/2019/03/curvy-bump-chart-slope-chart-template.html
- [ ] Add minimal functionality to switch between chart types
    - [ ] Differentiate fastest growing > 100, > 1000
    - [ ] Default: fastest growing > 1000
- [ ] Add minimal functionality to switch date interval
- [ ] Clean up components code
- [ ] Minor UI polish
- [ ] Minimal code to handle if API isn't available
    - [ ] Loading animation
- [ ] Publish!

### Wishlist
- [ ] Ability to change number of languages shown
    - Based on a limited number of presets, e.g. 10, 15, 25
        - 25 might be too much, even 15 gets pretty messy...
        - But then is it even worth having this feature just to change between 10 and 15? Maybe it would be better to just pick one?

### Non-goals
- Showing languages other than the provided options
- Showing dates other than the provided ranges
- Any kind of analysis
- Tests 😬
