(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{167:function(e,t,n){e.exports=n(321)},186:function(e,t,n){},308:function(e,t,n){},321:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),c=n(40),i=n.n(c),s=n(16),u=n(17),o=n(21),l=n(20),h=n(22),p=n(32),f=n(326),v=n(330),d=n(327),m=n(7),g=n.n(m),b=n(9),y=n(143),k=n.n(y),_=n(33),x=n(333),O=n(325),w=n(328),S=n(34),T="https://langtrends.herokuapp.com",E="gUCOBkxuddyoV7Z1KjZby0AMoQRvqmKahVWK7ZOrZTGJaSl5uMsKGKhzfZNANyAP",j=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"buildDates",value:function(){var t=Object(b.a)(g.a.mark(function t(n){var a,r,c,i,s,u=arguments;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=u.length>1&&void 0!==u[1]?u[1]:S.numberOfDates,r=[],t.next=4,e._getLatestDateFromApi();case 4:return c=t.sent,t.next=7,e._getEarliestDateFromApi();case 7:i=t.sent,s=0;case 9:if(!(s<a)){t.next=17;break}if(!(c<=i)){t.next=12;break}return t.abrupt("break",17);case 12:r.push(c),c=e._subtractMonthsUTC(c,n);case 14:s++,t.next=9;break;case 17:return t.abrupt("return",r.reverse());case 18:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()},{key:"_getEarliestDateFromApi",value:function(){var t=Object(b.a)(g.a.mark(function t(){var n,a;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return n={order:"date ASC",limit:1},t.next=3,e._callApi(n);case 3:return a=t.sent,t.abrupt("return",new Date(a[0].date));case 5:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}()},{key:"_getLatestDateFromApi",value:function(){var t=Object(b.a)(g.a.mark(function t(n){var a,r;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a={order:"date DESC",limit:1},t.next=3,e._callApi(a,n);case 3:return r=t.sent,t.abrupt("return",new Date(r[0].date));case 5:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()},{key:"_subtractMonthsUTC",value:function(e,t){var n=new Date(e);return n.setUTCMonth(n.getUTCMonth()-t),n}},{key:"_callApi",value:function(){var t=Object(b.a)(g.a.mark(function t(n,a){var r,c,i;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(r=encodeURI("".concat(T,"/api/scores?filter=").concat(JSON.stringify(n),"&access_token=").concat(E)),!a&&"caches"in window.self){t.next=7;break}return t.next=4,fetch(r);case 4:c=t.sent,t.next=19;break;case 7:return t.next=9,e._getCache();case 9:return i=t.sent,t.next=12,i.match(r);case 12:if("undefined"!==typeof(c=t.sent)){t.next=19;break}return t.next=16,i.add(r);case 16:return t.next=18,i.match(r);case 18:c=t.sent;case 19:return t.abrupt("return",c.json());case 20:case"end":return t.stop()}},t)}));return function(e,n){return t.apply(this,arguments)}}()},{key:"_getCache",value:function(){var t=Object(b.a)(g.a.mark(function t(){var n,a;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return n=e._getCurrentYearMonthString(),t.next=3,caches.has(n);case 3:if(!t.sent){t.next=7;break}return t.next=6,caches.open(n);case 6:return t.abrupt("return",t.sent);case 7:return t.next=9,e._getLatestYearMonthStringFromApi();case 9:if((a=t.sent)!==n||!e._isApiFinishedSyncing(n)){t.next=16;break}return t.next=13,e._deleteAllCaches();case 13:return t.next=15,caches.open(n);case 15:return t.abrupt("return",t.sent);case 16:return t.next=18,caches.open(a);case 18:return t.abrupt("return",t.sent);case 19:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}()},{key:"_isApiFinishedSyncing",value:function(){var t=Object(b.a)(g.a.mark(function t(n){return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e._getNumberOfLanguagesFromApi(n);case 2:return t.t0=t.sent,t.next=5,e._getTotalNumberOfLanguages();case 5:return t.t1=t.sent,t.abrupt("return",t.t0===t.t1);case 7:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()},{key:"_getNumberOfLanguagesFromApi",value:function(){var e=Object(b.a)(g.a.mark(function e(t){var n,a,r;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n={date:t},a=encodeURI("".concat(T,"/api/scores/count?where=").concat(JSON.stringify(n),"&access_token=").concat(E)),e.next=4,fetch(a);case 4:return r=e.sent,e.next=7,r.json();case 7:return e.abrupt("return",e.sent.count);case 8:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}()},{key:"_getTotalNumberOfLanguages",value:function(){var e=Object(b.a)(g.a.mark(function e(){var t,n;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("https://raw.githubusercontent.com/bmaupin/langtrends-api/master/server/boot/classes/languages.json");case 2:return t=e.sent,e.next=5,t.json();case 5:return n=e.sent,e.abrupt("return",Object.keys(n).reduce(function(e,t){return!0===n[t].include&&(e+=1),e},0));case 7:case"end":return e.stop()}},e)}));return function(){return e.apply(this,arguments)}}()},{key:"_getCurrentYearMonthString",value:function(){return(new Date).toISOString().slice(0,7)}},{key:"_getLatestYearMonthStringFromApi",value:function(){var t=Object(b.a)(g.a.mark(function t(){return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e._getLatestDateFromApi(!0);case 2:return t.abrupt("return",t.sent.toISOString().slice(0,7));case 3:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}()},{key:"_deleteAllCaches",value:function(){var e=Object(b.a)(g.a.mark(function e(){var t,n,a,r,c,i;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=!0,n=!1,a=void 0,e.prev=3,e.next=6,caches.keys();case 6:e.t0=Symbol.iterator,r=e.sent[e.t0]();case 8:if(t=(c=r.next()).done){e.next=15;break}return i=c.value,e.next=12,caches.delete(i);case 12:t=!0,e.next=8;break;case 15:e.next=21;break;case 17:e.prev=17,e.t1=e.catch(3),n=!0,a=e.t1;case 21:e.prev=21,e.prev=22,t||null==r.return||r.return();case 24:if(e.prev=24,!n){e.next=27;break}throw a;case 27:return e.finish(24);case 28:return e.finish(21);case 29:case"end":return e.stop()}},e,null,[[3,17,21,29],[22,,24,28]])}));return function(){return e.apply(this,arguments)}}()},{key:"getAllScores",value:function(){var t=Object(b.a)(g.a.mark(function t(n){var a;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=e._buildApiFilter(n),t.next=3,e._callApi(a);case 3:return t.abrupt("return",t.sent);case 4:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()},{key:"_buildApiFilter",value:function(e){return{where:{or:e.map(function(e){return{date:e}})},include:"language"}}},{key:"areScoresCached",value:function(){var t=Object(b.a)(g.a.mark(function t(n){var a,r,c,i;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return a=e._buildApiFilter(n),r=encodeURI("".concat(T,"/api/scores?filter=").concat(JSON.stringify(a),"&access_token=").concat(E)),c=e._getCurrentYearMonthString(),t.next=5,caches.has(c);case 5:if(!t.sent){t.next=15;break}return t.next=8,caches.open(c);case 8:return i=t.sent,t.next=11,i.match(r);case 11:return t.t0=typeof t.sent,t.abrupt("return","undefined"!==t.t0);case 15:return t.abrupt("return",!1);case 16:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()}]),e}(),C=n(34),A=function(){function e(t){Object(s.a)(this,e),this._interval=t}return Object(u.a)(e,[{key:"getDates",value:function(){var e=Object(b.a)(g.a.mark(function e(){return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this._getDatesForCalculations();case 2:return e.abrupt("return",e.sent.slice(1));case 3:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"_getDatesForCalculations",value:function(){var e=Object(b.a)(g.a.mark(function e(){var t;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!==typeof this._dates){e.next=5;break}return e.next=3,j.buildDates(this._interval,C.numberOfDates+1);case 3:t=e.sent,this._dates=t.map(function(e){return e.toISOString()});case 5:return e.abrupt("return",this._dates);case 6:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"getSeries",value:function(){var t=Object(b.a)(g.a.mark(function t(){var n,a,r,c,i,s,u;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this._getDatesForCalculations();case 2:return n=t.sent,t.next=5,j.getAllScores(n);case 5:return a=t.sent,r=e._organizeScoresByDate(a),c=this._getCustomScoresByDate(r,n),t.next=10,this.getDates();case 10:return i=t.sent,t.next=13,e._calculateTopScores(c,i);case 13:return s=t.sent,t.next=16,this._formatDataForChart(s,i);case 16:return u=t.sent,t.abrupt("return",u);case 18:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"_getCustomScoresByDate",value:function(t,n){for(var a={},r=1;r<n.length;r++){var c=n[r],i=n[r-1];for(var s in a[c]={},t[c])if(t[c][s]>C.minimumScore){var u=this._calculateCustomScore(t[i][s],t[c][s]);u=e._convertNonFiniteToNull(u),a[c][s]=u}}return a}},{key:"_formatDataForChart",value:function(){var t=Object(b.a)(g.a.mark(function t(n,a){var r,c,i,s,u,o,l,h,p,f,v,d,m,b,y,k,_,x,O;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:for(r=[],c=e._getAllTopLanguages(n),i=!0,s=!1,u=void 0,t.prev=5,o=c[Symbol.iterator]();!(i=(l=o.next()).done);i=!0)h=l.value,r.push({title:h,data:[]});t.next=13;break;case 9:t.prev=9,t.t0=t.catch(5),s=!0,u=t.t0;case 13:t.prev=13,t.prev=14,i||null==o.return||o.return();case 16:if(t.prev=16,!s){t.next=19;break}throw u;case 19:return t.finish(16);case 20:return t.finish(13);case 21:p=0;case 22:if(!(p<a.length)){t.next=47;break}for(f=a[p],v=0,d=!0,m=!1,b=void 0,t.prev=28,y=c[Symbol.iterator]();!(d=(k=y.next()).done);d=!0)_=k.value,x=null,O=null,n[f].hasOwnProperty(_)&&(x=n[f][_],O=Object.keys(n[f]).indexOf(_)+1),r[v].data.push({x:p,y:O,hintTitle:_,hintValue:this._formatHintValue(x)}),v++;t.next=36;break;case 32:t.prev=32,t.t1=t.catch(28),m=!0,b=t.t1;case 36:t.prev=36,t.prev=37,d||null==y.return||y.return();case 39:if(t.prev=39,!m){t.next=42;break}throw b;case 42:return t.finish(39);case 43:return t.finish(36);case 44:p++,t.next=22;break;case 47:return t.abrupt("return",r);case 48:case"end":return t.stop()}},t,this,[[5,9,13,21],[14,,16,20],[28,32,36,44],[37,,39,43]])}));return function(e,n){return t.apply(this,arguments)}}()},{key:"isSeriesCached",value:function(){var e=Object(b.a)(g.a.mark(function e(){var t;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this._getDatesForCalculations();case 2:return t=e.sent,e.next=5,j.areScoresCached(t);case 5:return e.abrupt("return",e.sent);case 6:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()}],[{key:"_organizeScoresByDate",value:function(e){for(var t={},n=0;n<e.length;n++){var a=e[n].date,r=e[n].language.name,c=e[n].points;t.hasOwnProperty(a)||(t[a]={}),t[a][r]=c}return t}},{key:"_convertNonFiniteToNull",value:function(e){return Number.isFinite(e)||(e=null),e}},{key:"_calculateTopScores",value:function(){var e=Object(b.a)(g.a.mark(function e(t,n){var a,r,c;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:for(a={},r=function(e){var r=n[e];a[r]={};for(var c=Object.keys(t[r]).sort(function(e,n){return t[r][n]-t[r][e]}),i=0;i<C.numberOfLanguages;i++){var s=c[i];a[r][s]=t[r][s]}},c=0;c<n.length;c++)r(c);return e.abrupt("return",a);case 4:case"end":return e.stop()}},e)}));return function(t,n){return e.apply(this,arguments)}}()},{key:"_getAllTopLanguages",value:function(e){var t=[];for(var n in e)for(var a in e[n])t.includes(a)||t.push(a);return t}}]),e}(),L=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(u.a)(t,[{key:"_calculateCustomScore",value:function(e,t){return t}},{key:"_formatHintValue",value:function(e){return e}}]),t}(A),I=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(u.a)(t,[{key:"_calculateCustomScore",value:function(e,t){return t/e*100}},{key:"_formatHintValue",value:function(e){return"".concat(Math.round(e),"% growth")}}]),t}(A),M=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(u.a)(t,[{key:"_calculateCustomScore",value:function(e,t){return t-e}},{key:"_formatHintValue",value:function(e){return"+".concat(e)}}]),t}(A),D=function(){function e(){Object(s.a)(this,e)}return Object(u.a)(e,null,[{key:"fromType",value:function(){var t=Object(b.a)(g.a.mark(function t(n,a){var r;return g.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:t.t0=n,t.next=t.t0===e.CHART_TYPES.FASTEST_GROWTH?3:t.t0===e.CHART_TYPES.MOST_GROWTH?5:t.t0===e.CHART_TYPES.TOP_LANGUAGES?7:9;break;case 3:return r=new I(a),t.abrupt("break",10);case 5:return r=new M(a),t.abrupt("break",10);case 7:return r=new L(a),t.abrupt("break",10);case 9:throw new Error("Unknown chart type: ".concat(n));case 10:return t.abrupt("return",r);case 11:case"end":return t.stop()}},t)}));return function(e,n){return t.apply(this,arguments)}}()}]),e}();D.CHART_TYPES={FASTEST_GROWTH:"fastestgrowth",MOST_GROWTH:"mostgrowth",TOP_LANGUAGES:"toplanguages"};var F=D;function N(e,t){this._context=e,this._compression=t}N.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(e,t){switch(e=+e,t=+t,this._point){case 0:this._point=1,this._line?this._context.lineTo(e,t):this._context.moveTo(e,t);break;case 1:this._point=2;default:!function(e,t,n){e._context.bezierCurveTo(e._prevX+(t-e._prevX)*e._compression,e._prevY,t-(t-e._prevX)*e._compression,n,t,n)}(this,e,t)}this._prevX=e,this._prevY=t}};var H=function e(t){function n(e){return new N(e,t)}return n.compression=function(t){return e(t)},n}(.75),R=(n(186),n(187),function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(l.a)(t).call(this,e))).state={chartData:null,dates:[],hintValue:null,hoveredSeriesIndex:null,isLoading:!0,showloadingMessage:!1},setTimeout(function(){n.setState({showloadingMessage:!0})},4e3),n._onValueMouseOut=n._onValueMouseOut.bind(Object(p.a)(n)),n._onValueMouseOver=n._onValueMouseOver.bind(Object(p.a)(n)),n._xAxisLabelFormatter=n._xAxisLabelFormatter.bind(Object(p.a)(n)),n}return Object(h.a)(t,e),Object(u.a)(t,[{key:"componentDidMount",value:function(){var e=Object(b.a)(g.a.mark(function e(){return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.loadChartData();case 2:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"componentDidUpdate",value:function(){var e=Object(b.a)(g.a.mark(function e(t){return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.props.chartType===t.chartType&&this.props.intervalInMonths===t.intervalInMonths){e.next=3;break}return e.next=3,this.loadChartData();case 3:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"loadChartData",value:function(){var e=Object(b.a)(g.a.mark(function e(){var n,a,r,c,i;return g.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,F.fromType(this.props.chartType,this.props.intervalInMonths);case 2:return this._chart=e.sent,e.next=5,this._chart.isSeriesCached();case 5:return n=e.sent,this.setState({isLoading:!n}),e.next=9,this._chart.getDates();case 9:return a=e.sent,e.next=12,this._chart.getSeries();case 12:r=e.sent,c=t._generateLeftYAxisLabels(r),i=t._generateRightYAxisLabels(r),this.setState({chartData:r,dates:a,isLoading:!1,leftYAxisLabels:c,rightYAxisLabels:i,showloadingMessage:!1});case 16:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"_formatHint",value:function(e){return[{title:e.hintTitle,value:e.hintValue}]}},{key:"_onValueMouseOut",value:function(){this.setState({hintValue:null,hoveredSeriesIndex:null})}},{key:"_onValueMouseOver",value:function(e,t){this.setState({hintValue:e,hoveredSeriesIndex:t})}},{key:"_xAxisLabelFormatter",value:function(e,n){return t._formatDateForLabel(this.state.dates[n])}},{key:"_renderLoadingSpinner",value:function(){return r.a.createElement(x.a.Dimmable,{blurring:!0,dimmed:!0},r.a.createElement(x.a,{active:!0,inverted:!0},r.a.createElement(O.a,{size:"massive"},this.state.showloadingMessage&&r.a.createElement("span",null,"Please wait",r.a.createElement("div",{style:{fontSize:"0.6em",marginTop:"0.5em"}},"(The backend may take up to 30 seconds to start)")))),r.a.createElement(w.a,{src:"assets/images/chart-placeholder.png"}))}},{key:"render",value:function(){var e=this;if(this.state.isLoading||!this.state.chartData)return this._renderLoadingSpinner();var t=H.compression(.5);return r.a.createElement("div",{className:"chart-container"},r.a.createElement("div",{className:"chart-content"},r.a.createElement(_.a,{height:49*C.numberOfLanguages,margin:{left:80,right:80},yDomain:[C.numberOfLanguages,1]},r.a.createElement(_.e,null),r.a.createElement(_.c,null),r.a.createElement(_.f,{tickFormat:this._xAxisLabelFormatter,tickTotal:this.state.dates.length}),r.a.createElement(_.g,{orientation:"left",tickFormat:function(t,n){return e.state.leftYAxisLabels[n]}}),r.a.createElement(_.g,{orientation:"right",tickFormat:function(t,n){return e.state.rightYAxisLabels[n]}}),this.state.chartData.map(function(n,a){return r.a.createElement(_.d,{curve:t,getNull:function(e){return null!==e.y},key:n.title,color:k.a.get(n.title,!0).color,data:n.data,opacity:null===e.state.hoveredSeriesIndex||e.state.hoveredSeriesIndex===a?1:.5,onValueMouseOut:e._onValueMouseOut,onValueMouseOver:function(t){return e._onValueMouseOver(t,a)},strokeWidth:null!==e.state.hoveredSeriesIndex&&e.state.hoveredSeriesIndex===a?4:null,lineStyle:{pointerEvents:"none"}})}),this.state.hintValue&&r.a.createElement(_.b,{format:this._formatHint,value:this.state.hintValue}))))}}],[{key:"_generateLeftYAxisLabels",value:function(e){return e.map(function(e){return e.data[0]}).sort(function(e,t){return t.y-e.y}).map(function(e){return e&&e.hintTitle})}},{key:"_generateRightYAxisLabels",value:function(e){return e.map(function(e){return e.data[e.data.length-1]}).sort(function(e,t){return t.y-e.y}).map(function(e){return e&&e.hintTitle})}},{key:"_formatDateForLabel",value:function(e){return e.slice(0,7)}}]),t}(a.Component)),Y=n(329);function V(e){var t=e.intervalInMonths;return r.a.createElement(Y.a,{secondary:!0},r.a.createElement(Y.a.Item,{name:"monthly",value:"1",active:1===t,onClick:e.handleItemClick}),r.a.createElement(Y.a.Item,{name:"quarterly",value:"3",active:3===t,onClick:e.handleItemClick}),r.a.createElement(Y.a.Item,{name:"yearly",value:"12",active:12===t,onClick:e.handleItemClick}))}function G(e){var t=e.chartType;return r.a.createElement(Y.a,{secondary:!0},r.a.createElement(Y.a.Item,{name:F.CHART_TYPES.FASTEST_GROWTH,active:t===F.CHART_TYPES.FASTEST_GROWTH,onClick:e.handleItemClick},"Fastest growth"),r.a.createElement(Y.a.Item,{name:F.CHART_TYPES.MOST_GROWTH,active:t===F.CHART_TYPES.MOST_GROWTH,onClick:e.handleItemClick},"Most growth"),r.a.createElement(Y.a.Item,{name:F.CHART_TYPES.TOP_LANGUAGES,active:t===F.CHART_TYPES.TOP_LANGUAGES,onClick:e.handleItemClick},"Top"))}n(308);var P=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(l.a)(t).call(this,e))).state={chartType:F.CHART_TYPES.MOST_GROWTH,intervalInMonths:3},n.handleChartTypeChanged=n.handleChartTypeChanged.bind(Object(p.a)(n)),n.handleIntervalChanged=n.handleIntervalChanged.bind(Object(p.a)(n)),n}return Object(h.a)(t,e),Object(u.a)(t,[{key:"handleChartTypeChanged",value:function(e,t){var n=t.name;this.setState({chartType:n})}},{key:"handleIntervalChanged",value:function(e,t){var n=t.value;this.setState({intervalInMonths:Number(n)})}},{key:"render",value:function(){return r.a.createElement(f.a,null,r.a.createElement(v.a,{centered:!0,padded:!0},r.a.createElement(d.a.Group,{className:"chart-group"},r.a.createElement(d.a.Content,null,r.a.createElement(v.a,{centered:!0,padded:!0},r.a.createElement(G,{chartType:this.state.chartType,handleItemClick:this.handleChartTypeChanged})),r.a.createElement(R,{chartType:this.state.chartType,intervalInMonths:this.state.intervalInMonths}),r.a.createElement(v.a,{centered:!0,padded:!0},r.a.createElement(V,{handleItemClick:this.handleIntervalChanged,intervalInMonths:this.state.intervalInMonths}))))))}}]),t}(a.Component),W=n(332),U=n(99),z=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return r.a.createElement(Y.a,{attached:!0,borderless:!0,inverted:!0},r.a.createElement(f.a,null,r.a.createElement(Y.a.Item,{fitted:"horizontally",header:!0},"Programming language trends"),r.a.createElement(Y.a.Menu,{position:"right"},r.a.createElement(W.a,{on:"click",trigger:r.a.createElement(Y.a.Item,{icon:!0},r.a.createElement(U.a,{name:"help circle",size:"big"}))},r.a.createElement(W.a.Content,null,r.a.createElement("h3",null,"How the data is calculated"),r.a.createElement("p",null,"First, a base numerical value for a given language and date is calculated by adding the total number of GitHub repositories to the total number of Stack Overflow tags for that language up to that day."),r.a.createElement("h4",null,"Fastest growth"),r.a.createElement("p",null,"Languages with the highest percentage change compared to the previous date. Note that scores under a certain threshold (",r.a.createElement("a",{href:"https://github.com/bmaupin/langtrends/blob/master/src/settings.json#L2"},"currently 1000"),") are filtered out to reduce"," ",r.a.createElement("a",{href:"https://xkcd.com/1102/"},"dubiousness"),"."),r.a.createElement("h4",null,"Most growh"),r.a.createElement("p",null,"Languages with the highest numerical change compared to the previous date."),r.a.createElement("h4",null,"Top"),r.a.createElement("p",null,"Languages with the total highest value for a particular given date."))),r.a.createElement(Y.a.Item,{href:"https://github.com/bmaupin/langtrends",icon:!0},r.a.createElement(U.a,{name:"github",size:"big"})))))}}]),t}(a.Component),B=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(u.a)(t,[{key:"render",value:function(){return r.a.createElement("div",{className:"App"},r.a.createElement(z,null),r.a.createElement(P,null))}}]),t}(a.Component),J=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function K(e){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var t=e.installing;t.onstatechange=function(){"installed"===t.state&&(navigator.serviceWorker.controller?console.log("New content is available; please refresh."):console.log("Content is cached for offline use."))}}}).catch(function(e){console.error("Error during service worker registration:",e)})}i.a.render(r.a.createElement(B,null),document.getElementById("root")),function(){if("serviceWorker"in navigator){if(new URL("/langtrends",window.location).origin!==window.location.origin)return;window.addEventListener("load",function(){var e="".concat("/langtrends","/service-worker.js");J?(function(e){fetch(e).then(function(t){404===t.status||-1===t.headers.get("content-type").indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):K(e)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://goo.gl/SC7cgQ")})):K(e)})}}()},34:function(e){e.exports={minimumScore:1e3,numberOfDates:12,numberOfLanguages:10}}},[[167,1,2]]]);
//# sourceMappingURL=main.819875d3.chunk.js.map