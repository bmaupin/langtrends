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
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
        // Drop any excess labels
        .slice(0, settings.numberOfLanguages)
    );
  };

  // TODO: remove duplication here?
  const generateRightYAxisLabels = (series: SeriesData[]): string[] => {
    return (
      series
        // Get just the data for the last date
        .map((languageData) => languageData.data[languageData.data.length - 1])
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((languageData) => languageData && languageData.hintTitle)
        // Drop any excess labels
        .slice(0, settings.numberOfLanguages)
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
  const xAxisLabelFormatter = (xValue: number): string => {
    if (dates[xValue]) {
      return formatDateForLabel(dates[xValue]);
    } else {
      return '';
    }
  };

  const formatDateForLabel = (date: string) => {
    return date.slice(0, 7);
  };

  const primaryAxis = React.useMemo(
    (): AxisOptions<SeriesPointWithHint> => ({
      formatters: {
        scale: xAxisLabelFormatter,
      },
      getValue: (datum) => datum.x,
      scaleType: 'linear',
    }),

    [dates]
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<SeriesPointWithHint>[] => [
      {
        curve: D3SigmoidCurve.compression(0.5),
        formatters: {
          scale: (value: number) => {
            return leftYAxisLabels[value - 1];
          },
        },
        getValue: (datum) => {
          if (datum.y === 0) {
            return null;
          } else {
            return datum.y;
          }
        },
        invert: true,
        scaleType: 'linear',
        showDatumElements: true,
      },
    ],

    [leftYAxisLabels]
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
          getSeriesStyle: (series) => {
            return {
              color: GitHubColors.get(series.label, true).color,
            };
          },
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
    //         tickTotal={dates.length}
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
