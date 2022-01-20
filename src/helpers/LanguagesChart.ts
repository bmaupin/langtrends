import ApiHelper, { Score } from './ApiHelper';
import settings from '../settings.json';

export interface SeriesPoint {
  seriesLabel: string;
  tooltipValue: string;
  x: number;
  y: number;
}

export interface SeriesData {
  data: SeriesPoint[];
  label: string;
}

interface ScoresByDate {
  [key: string]: {
    [key: string]: number;
  };
}

export default abstract class LanguagesChart {
  private dates: string[] | undefined;
  private firstLanguageIndex: number;
  private interval: number;

  constructor(interval: number, firstLanguageIndex: number) {
    this.interval = interval;
    this.firstLanguageIndex = firstLanguageIndex;
  }

  protected abstract calculateCustomScore(
    oldValue: number,
    newValue: number
  ): number;

  protected abstract formatTooltipValue(tooltipValue: number): string;

  public async getDates() {
    // We need one extra date internally for calculations, so to avoid extra API calls just drop the extra date
    return (await this.getDatesForCalculations()).slice(1);
  }

  private async getDatesForCalculations() {
    if (!this.dates) {
      this.dates = await ApiHelper.buildDates(
        this.interval,
        settings.numberOfDates + 1
      );
    }

    return this.dates;
  }

  public async getSeries(): Promise<SeriesData[]> {
    const datesForCalculations = await this.getDatesForCalculations();
    const scoresFromApi = await ApiHelper.getScores(datesForCalculations);
    const scoresByDate = LanguagesChart.organizeScoresByDate(scoresFromApi);
    const customScoresByDate = this.getCustomScoresByDate(
      scoresByDate,
      datesForCalculations
    );
    const datesForChart = await this.getDates();
    const topCustomScores = await this.calculateTopScores(
      customScoresByDate,
      datesForChart
    );
    const formattedSeriesData = await this.formatDataForChart(
      topCustomScores,
      datesForChart
    );

    return formattedSeriesData;
  }

  // Organize scores by date so we can access each one directly
  private static organizeScoresByDate(scores: Score[]): ScoresByDate {
    const scoresByDate = {} as ScoresByDate;
    for (let i = 0; i < scores.length; i++) {
      const date = scores[i].date;
      const languageName = scores[i].language!.name;
      const points = scores[i].points;

      if (!scoresByDate.hasOwnProperty(date)) {
        scoresByDate[date] = {};
      }
      scoresByDate[date][languageName] = points;
    }

    return scoresByDate;
  }

  // Convert raw scores into custom scores (percentage change, score difference, etc)
  private getCustomScoresByDate(
    scoresByDate: ScoresByDate,
    datesForCalculations: string[]
  ): ScoresByDate {
    const customScoresByDate = {} as ScoresByDate;

    // Start from 1 because the previous date is just used for calculating the custom score
    for (let i = 1; i < datesForCalculations.length; i++) {
      const date = datesForCalculations[i];
      const previousDate = datesForCalculations[i - 1];
      customScoresByDate[date] = {};

      for (const languageName in scoresByDate[date]) {
        let customScore = this.calculateCustomScore(
          scoresByDate[previousDate][languageName]!,
          scoresByDate[date][languageName]!
        );

        customScore = LanguagesChart.convertNonFiniteNumber(customScore);

        customScoresByDate[date][languageName] = customScore;
      }
    }

    return customScoresByDate;
  }

  // I think this is a rare occurrence, but percentage change (for FastestGrowingLanguagesChart)
  // could be NaN or Infinity (e.g. if a previous month's value was 0)
  private static convertNonFiniteNumber(number: number): number {
    if (!Number.isFinite(number)) {
      return 0;
    }
    return number;
  }

  private async calculateTopScores(
    scoresByDate: ScoresByDate,
    dates: string[]
  ): Promise<ScoresByDate> {
    const topScores = {} as ScoresByDate;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      // TODO: make this a map to guarantee order
      topScores[date] = {};

      // Sort scores so we can get the top N and do an ordinal ranking for a bump chart
      const sortedKeys = Object.keys(scoresByDate[date]).sort(function (a, b) {
        return scoresByDate[date][b]! - scoresByDate[date][a]!;
      });

      for (
        let i = this.firstLanguageIndex;
        i < settings.numberOfLanguages + this.firstLanguageIndex;
        i++
      ) {
        if (sortedKeys[i]) {
          const languageName = sortedKeys[i];
          topScores[date][languageName] = scoresByDate[date][languageName];
        }
      }
    }

    return topScores;
  }

  private async formatDataForChart(
    topScores: ScoresByDate,
    dates: string[]
  ): Promise<SeriesData[]> {
    const formattedScores = [] as SeriesData[];
    const allTopLanguages = LanguagesChart.getAllTopLanguages(topScores);

    for (const languageName of allTopLanguages) {
      formattedScores.push({
        label: languageName,
        data: [],
      });
    }

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];

      let formattedScoresIndex = 0;
      for (let languageName of allTopLanguages) {
        let score = 0;
        let rank = 0;
        if (topScores[date].hasOwnProperty(languageName)) {
          score = topScores[date][languageName];
          // TODO: this should be a map to guarantee order
          rank = Object.keys(topScores[date]).indexOf(languageName) + 1;
        }

        formattedScores[formattedScoresIndex].data.push({
          x: i,
          // Use the ordinal number ranking for the chart data in order to create a bump chart
          y: rank,
          // TODO: don't add seriesLabel and tooltipValue if score is 0
          seriesLabel: languageName,
          // Add the custom score as a separate property so it can be used for hints on mouseover
          tooltipValue: this.formatTooltipValue(score),
        });
        formattedScoresIndex++;
      }
    }

    return formattedScores;
  }

  private static getAllTopLanguages(topScores: ScoresByDate): string[] {
    const allTopLanguages = [] as string[];

    for (const date in topScores) {
      for (const languageName in topScores[date]) {
        if (!allTopLanguages.includes(languageName)) {
          allTopLanguages.push(languageName);
        }
      }
    }

    return allTopLanguages;
  }
}
