import GitHubColors from 'github-colors';
import React, { useEffect, useState } from 'react';
import {
  FlexibleWidthXYPlot,
  Hint,
  HorizontalGridLines,
  LineMarkSeries,
  VerticalGridLines,
  XAxis,
  YAxis,
} from 'react-vis';

import ChartFactory from '../helpers/ChartFactory';
import D3SigmoidCurve from '../helpers/D3SigmoidCurve';
import settings from '../settings.json';

import './Chart.css';
import '../../node_modules/react-vis/dist/style.css';

export default function Chart(props: {
  chartType: string;
  intervalInMonths: number;
}) {
  const [chartData, setChartData] = useState([]);
  const [dates, setDates] = useState([]);
  const [hintValue, setHintValue] = useState(null);
  const [hoveredSeriesIndex, setHoveredSeriesIndex] = useState(null);
  const [leftYAxisLabels, setLeftYAxisLabels] = useState([]);
  const [rightYAxisLabels, setRightYAxisLabels] = useState([]);

  useEffect(() => {
    const loadChartData = async () => {
      const chart = await ChartFactory.fromType(
        props.chartType,
        props.intervalInMonths
      );

      // TODO: just one object for chart data?
      const dates = await chart.getDates();
      const series = await chart.getSeries();

      const leftYAxisLabels = generateLeftYAxisLabels(series);
      const rightYAxisLabels = generateRightYAxisLabels(series);

      setChartData(series);
      setDates(dates);
      setLeftYAxisLabels(leftYAxisLabels);
      setRightYAxisLabels(rightYAxisLabels);
    };

    loadChartData();
  }, [props.chartType, props.intervalInMonths]);

  const generateLeftYAxisLabels = (series) => {
    return (
      series
        // Get just the data for the first date
        .map((languageData) => languageData.data[0])
        // Sort in reverse order because the y values are ordinal ranks (1 should be first, not 10)
        .sort((a, b) => b.y - a.y)
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
    );
  };

  // TODO: remove duplication here?
  const generateRightYAxisLabels = (series) => {
    return (
      series
        // Get just the data for the last date
        .map((languageData) => languageData.data[languageData.data.length - 1])
        // Sort in reverse order because the y values are ordinal ranks (1 should be first, not 10)
        .sort((a, b) => b.y - a.y)
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
    );
  };

  const formatHint = (value) => {
    return [
      {
        title: value.hintTitle,
        value: value.hintValue,
      },
    ];
  };

  const onValueMouseOut = () => {
    setHintValue(null);
    setHoveredSeriesIndex(null);
  };

  const onValueMouseOver = (value, index) => {
    setHintValue(value);
    setHoveredSeriesIndex(index);
  };

  // TODO: could we just format the dates ahead of time and get rid of this method?
  const xAxisLabelFormatter = (_value, index) => {
    return formatDateForLabel(dates[index]);
  };

  const formatDateForLabel = (date) => {
    // TODO: date can be undefined?
    if (date) {
      return date.slice(0, 7);
    }
  };

  const d3sigmoidcurve = D3SigmoidCurve.compression(0.5);

  return (
    <div className="chart-container">
      <div className="chart-content">
        <FlexibleWidthXYPlot
          height={settings.numberOfLanguages * 49}
          margin={{
            left: 80,
            right: 80,
          }}
          // Reverse the y scale since we're doing a bump chart
          yDomain={[settings.numberOfLanguages, 1]}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickFormat={xAxisLabelFormatter} tickTotal={dates.length} />
          <YAxis orientation="left" tickFormat={(v, i) => leftYAxisLabels[i]} />
          <YAxis
            orientation="right"
            tickFormat={(v, i) => rightYAxisLabels[i]}
          />
          {chartData.map((entry, i) => (
            <LineMarkSeries
              curve={d3sigmoidcurve}
              getNull={(d) => d.y !== null}
              key={entry.title}
              color={GitHubColors.get(entry.title, true).color}
              data={entry.data}
              opacity={
                hoveredSeriesIndex === null || hoveredSeriesIndex === i
                  ? 1
                  : 0.5
              }
              onValueMouseOut={onValueMouseOut}
              onValueMouseOver={(datapoint) => onValueMouseOver(datapoint, i)}
              strokeWidth={
                hoveredSeriesIndex !== null && hoveredSeriesIndex === i
                  ? 4
                  : null
              }
              lineStyle={{ pointerEvents: 'none' }}
            />
          ))}
          {hintValue && <Hint format={formatHint} value={hintValue} />}
        </FlexibleWidthXYPlot>
      </div>
    </div>
  );
}
