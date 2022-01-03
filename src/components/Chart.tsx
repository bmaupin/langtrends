import GitHubColors from 'github-colors';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { AxisOptions, Chart as ReactChart } from 'react-charts';
import {
  FlexibleWidthXYPlot,
  Hint,
  LineMarkSeries,
  RVTickFormat,
} from 'react-vis';

import ChartFactory from '../helpers/ChartFactory';
import D3SigmoidCurve from '../helpers/D3SigmoidCurve';
import settings from '../settings.json';

import './Chart.css';
import '../../node_modules/react-vis/dist/style.css';
import { SeriesData, SeriesPoint } from '../helpers/LanguagesChart';

export default function Chart(props: {
  chartType: string;
  intervalInMonths: number;
}) {
  const [chartData, setChartData] = useState([] as SeriesData[]);
  const [dates, setDates] = useState([] as string[]);
  const [focusedDatum, setFocusedDatum] = useState({} as SeriesPoint);
  const [focusedDatumTooltip, setFocusedDatumTooltip] = useState('');
  const [hintValue, setHintValue] = useState(null as SeriesPoint | null);
  const [focusedSeriesIndex, setFocusedSeriesIndex] = useState(
    null as number | null
  );
  const [leftYAxisLabels, setLeftYAxisLabels] = useState([] as string[]);
  const [rightYAxisLabels, setRightYAxisLabels] = useState([] as string[]);

  useEffect(() => {
    const generateLeftYAxisLabels = (series: SeriesData[]): string[] => {
      return generateYAxisLabels(
        // Get just the data for the first date
        series.map((languageData) => languageData.data[0])
      );
    };

    const generateRightYAxisLabels = (series: SeriesData[]): string[] => {
      return generateYAxisLabels(
        // Get just the data for the last date
        series.map(
          (languageData) => languageData.data[languageData.data.length - 1]
        )
      );
    };

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

  const generateYAxisLabels = (seriesPoints: SeriesPoint[]): string[] => {
    return (
      seriesPoints
        // Filter out 0 y values
        .filter((seriesPoint) => seriesPoint.y !== 0)
        // Sort by y value
        .sort((a, b) => a.y - b.y)
        // Drop everything else (x value, y value) and return just a list of hint titles
        .map((seriesPoint) => seriesPoint && seriesPoint.hintTitle)
    );
  };

  const formatHint = (value: SeriesPoint) => {
    return [
      {
        title: value.hintTitle,
        value: value.hintValue,
      },
    ];
  };

  const onValueMouseOut = () => {
    setHintValue(null);
    setFocusedSeriesIndex(null);
  };

  const onValueMouseOver = (value: SeriesPoint, index: number) => {
    setHintValue(value);
    setFocusedSeriesIndex(index);
  };

  const primaryAxis = React.useMemo((): AxisOptions<SeriesPoint> => {
    const formatDateForLabel = (date: string) => {
      return date.slice(0, 7);
    };

    const xAxisLabelFormatter = (xValue: number): string => {
      if (dates[xValue]) {
        return formatDateForLabel(dates[xValue]);
      } else {
        return '';
      }
    };

    return {
      formatters: {
        scale: xAxisLabelFormatter,
      },
      getValue: (datum) => datum.x,
      scaleType: 'linear',
    };
  }, [dates]);

  const secondaryAxes = React.useMemo((): AxisOptions<SeriesPoint>[] => {
    const yAxisProperties = {
      getValue: (datum: SeriesPoint) => {
        if (datum.y === 0) {
          return null;
        } else {
          return datum.y;
        }
      },
      invert: true,
      scaleType: 'linear',
    };

    return [
      // Left y axis
      {
        ...yAxisProperties,
        curve: D3SigmoidCurve.compression(0.5),
        formatters: {
          scale: (value: number) => {
            return leftYAxisLabels[value - 1];
          },
          tooltip: (value: number) => {
            // return focusedDatumTooltip;

            for (const series of chartData) {
              if (
                series.data[focusedDatum.x] &&
                series.data[focusedDatum.x].y === value
              ) {
                return series.data[focusedDatum.x].hintValue;
              }
            }

            return undefined;
          },
        },
        showDatumElements: true,
      } as AxisOptions<SeriesPoint>,

      // Right y axis
      {
        ...yAxisProperties,
        formatters: {
          scale: (value: number) => {
            return rightYAxisLabels[value - 1];
          },
        },
        position: 'right',
      } as AxisOptions<SeriesPoint>,
    ];
  }, [focusedDatumTooltip, focusedDatum, leftYAxisLabels, rightYAxisLabels]);

  return (
    <div
      // TODO: use more of the available vertical height of the page
      style={{
        height: settings.numberOfLanguages * 49,
      }}
    >
      <ReactChart
        options={{
          data: chartData,
          // Work around https://github.com/tannerlinsley/react-charts/issues/266
          getDatumStyle: (datum, status) => {
            if (status === 'focused') {
              // setFocusedDatumTooltip(datum.originalDatum.hintValue);
              setFocusedDatum(datum.originalDatum);
            }

            if (datum.secondaryValue === null) {
              return {
                circle: {
                  r: 0,
                } as CSSProperties,
              };
            } else {
              return {};
            }
          },
          getSeriesStyle: (series, status) => {
            const defaultSeriesStyle = {
              circle: {
                r: 5,
              } as CSSProperties,
              color: GitHubColors.get(series.label, true).color,
              // Disable default animation of the series point circles "moving" into place
              transition: 'none',
            };

            // If a series is focused, return the style for the focused series
            if (status === 'focused') {
              setFocusedSeriesIndex(series.index);

              return {
                ...defaultSeriesStyle,
                circle: {
                  ...defaultSeriesStyle.circle,
                  strokeWidth: '4px',
                },
                line: {
                  strokeWidth: '4px',
                },
              };
            }

            // If the non-focused series index was previously saved as focused, it means
            // no series is focused right now
            else if (series.index === focusedSeriesIndex) {
              setFocusedSeriesIndex(null);
              return defaultSeriesStyle;
            }

            // If a series is focused, return the style for the non-focused series
            else if (focusedSeriesIndex !== null) {
              return {
                ...defaultSeriesStyle,
                circle: {
                  ...defaultSeriesStyle.circle,
                  opacity: '0.5',
                },
                line: {
                  opacity: '0.5',
                },
              };
            }

            // If no series is focused, return the default style
            else {
              return defaultSeriesStyle;
            }
          },
          // This fixes the hover behaviour, which otherwise sometimes highlights the incorrect series line
          interactionMode: 'closest',
          primaryAxis,
          // Disable the default horizontal line and label that show when a point is hovered
          primaryCursor: {
            showLabel: false,
            showLine: false,
          },
          secondaryAxes,
          // Disable the default vertical line and label that show when a point is hovered
          secondaryCursor: {
            showLabel: false,
            showLine: false,
          },
          tooltip: {
            // Only show the data for the hovered point in the tooltip
            // groupingMode: 'single',
            groupingMode: 'primary',
          },
        }}
      />
    </div>

    // <div className="chart-container">
    //   <div className="chart-content">
    //     <FlexibleWidthXYPlot
    //     >
    //       {chartData.map((entry, i) => (
    //         <LineMarkSeries
    //           key={entry.title}
    //           data={entry.data}
    //           onValueMouseOut={onValueMouseOut}
    //           onValueMouseOver={(datapoint) =>
    //             onValueMouseOver(datapoint as SeriesPointWithHint, i)
    //           }
    //         />
    //       ))}
    //       {hintValue && <Hint format={formatHint} value={hintValue} />}
    //     </FlexibleWidthXYPlot>
    //   </div>
    // </div>
  );
}
