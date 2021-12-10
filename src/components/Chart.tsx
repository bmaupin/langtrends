import GitHubColors from 'github-colors';
import React, { useEffect, useState } from 'react';
import { AxisOptions, Chart as ReactChart } from 'react-charts';
import {
  FlexibleWidthXYPlot,
  Hint,
  HorizontalGridLines,
  LineMarkSeries,
  RVTickFormat,
  VerticalGridLines,
  XAxis,
  YAxis,
} from 'react-vis';

import ChartFactory from '../helpers/ChartFactory';
import D3SigmoidCurve from '../helpers/D3SigmoidCurve';
import settings from '../settings.json';

import './Chart.css';
import '../../node_modules/react-vis/dist/style.css';
import { SeriesData, SeriesPointWithHint } from '../helpers/LanguagesChart';

export default function Chart(props: {
  chartType: string;
  intervalInMonths: number;
}) {
  const [chartData, setChartData] = useState([] as SeriesData[]);
  const [dates, setDates] = useState([] as string[]);
  const [hintValue, setHintValue] = useState(
    null as SeriesPointWithHint | null
  );
  const [hoveredSeriesIndex, setHoveredSeriesIndex] = useState(
    null as number | null
  );
  const [leftYAxisLabels, setLeftYAxisLabels] = useState([] as string[]);
  const [rightYAxisLabels, setRightYAxisLabels] = useState([] as string[]);

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

  const generateLeftYAxisLabels = (series: SeriesData[]): string[] => {
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
  const generateRightYAxisLabels = (series: SeriesData[]): string[] => {
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

  const formatHint = (value: SeriesPointWithHint) => {
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

  const onValueMouseOver = (value: SeriesPointWithHint, index: number) => {
    setHintValue(value);
    setHoveredSeriesIndex(index);
  };

  // TODO: could we just format the dates ahead of time and get rid of this method?
  const xAxisLabelFormatter = (_value: number, index: number) => {
    return formatDateForLabel(dates[index]);
  };

  const formatDateForLabel = (date: string) => {
    return date.slice(0, 7);
  };

  const primaryAxis = React.useMemo(
    (): AxisOptions<SeriesPointWithHint> => ({
      getValue: (datum) => datum.x,
      scaleType: 'linear',
    }),

    []
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<SeriesPointWithHint>[] => [
      {
        curve: D3SigmoidCurve.compression(0.5),
        getValue: (datum) => {
          if (datum.y === 0) {
            return null;
          } else {
            return datum.y;
          }
        },
        invert: true,
        scaleType: 'linear',
      },
    ],

    []
  );

  return (
    <div
      style={{
        height: settings.numberOfLanguages * 49,
      }}
    >
      <ReactChart
        options={{
          data: chartData,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </div>

    // <div className="chart-container">
    //   <div className="chart-content">
    //     <FlexibleWidthXYPlot
    //       height={settings.numberOfLanguages * 49}
    //       margin={{
    //         left: 80,
    //         right: 80,
    //       }}
    //       // Reverse the y scale since we're doing a bump chart
    //       yDomain={[settings.numberOfLanguages, 1]}
    //     >
    //       <VerticalGridLines />
    //       <HorizontalGridLines />
    //       <XAxis
    //         tickFormat={xAxisLabelFormatter as RVTickFormat}
    //         tickTotal={dates.length}
    //       />
    //       <YAxis
    //         orientation="left"
    //         tickFormat={
    //           ((_v: number, i: number) => leftYAxisLabels[i]) as RVTickFormat
    //         }
    //       />
    //       <YAxis
    //         orientation="right"
    //         tickFormat={
    //           ((_v: number, i: number) => rightYAxisLabels[i]) as RVTickFormat
    //         }
    //       />
    //       {chartData.map((entry, i) => (
    //         <LineMarkSeries
    //           // Don't draw zero values (they go way off the chart)
    //           getNull={(d) => d.y !== 0}
    //           key={entry.title}
    //           color={GitHubColors.get(entry.title, true).color}
    //           data={entry.data}
    //           opacity={
    //             hoveredSeriesIndex === null || hoveredSeriesIndex === i
    //               ? 1
    //               : 0.5
    //           }
    //           onValueMouseOut={onValueMouseOut}
    //           onValueMouseOver={(datapoint) =>
    //             onValueMouseOver(datapoint as SeriesPointWithHint, i)
    //           }
    //           strokeWidth={
    //             hoveredSeriesIndex !== null && hoveredSeriesIndex === i
    //               ? 4
    //               : undefined
    //           }
    //           lineStyle={{ pointerEvents: 'none' }}
    //         />
    //       ))}
    //       {hintValue && <Hint format={formatHint} value={hintValue} />}
    //     </FlexibleWidthXYPlot>
    //   </div>
    // </div>
  );
}
