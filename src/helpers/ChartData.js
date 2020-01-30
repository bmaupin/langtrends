import TopLanguagesChart from './TopLanguagesChart';
import FastestGrowingLanguagesChart from './FastestGrowingLanguagesChart';
import MostGrowthLanguages from './MostGrowthLanguages';

class ChartData {
  static async fromType(chartType, interval) {
    let chart;
    switch(chartType) {
      case ChartData.CHART_TYPES.FASTEST_GROWTH:
        chart = new FastestGrowingLanguagesChart(interval);
        break;
      case ChartData.CHART_TYPES.MOST_GROWTH:
        chart = new MostGrowthLanguages(interval);
        break;
      case ChartData.CHART_TYPES.TOP_LANGUAGES:
        chart = new TopLanguagesChart(interval);
        break;
      default:
        throw new Error(`Unknown chart type: ${chartType}`);
    }

    return chart;
  }
}

ChartData.CHART_TYPES = {
  FASTEST_GROWTH: 'fastestgrowth',
  MOST_GROWTH: 'mostgrowth',
  TOP_LANGUAGES: 'toplanguages',
};

export default ChartData;
