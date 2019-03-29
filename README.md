### To do
- [x] Convert fastest growing languages to basic bump chart
    - [x] Get basic bump chart working
    - [x] Show actual percent change in crosshair items?
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
- [ ] Better bump chart?
    - Instead of calculating fastest growing languages for current month (with null where that language has no score
    for that month), calculate it newly for every month
    - Can react-vis support this? Would we need to create a custom chart?
        - https://www.google.ca/search?q=javascript+bump+chart
        - https://www.google.ca/search?q=d3+bump+chart
- [ ] Add ability to view next N languages
