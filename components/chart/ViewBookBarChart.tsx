import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Rect, Svg, Text as TextSVG } from "react-native-svg";
import { format, subMonths, startOfMonth } from 'date-fns';
import { type MonthDataPointModel } from "../../types";

interface ViewBarChartProps {
    aggregatedData: MonthDataPointModel[];
}

const getLast6MonthsKeys = () => {
    const monthKeys = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const startOfMonthDate = startOfMonth(subMonths(today, i));
      monthKeys.push(format(startOfMonthDate, 'MMM yyyy'));
    }
    return monthKeys.reverse();
};
  
const matchDataToMonths = (data: MonthDataPointModel[]) => {
    const monthKeys = getLast6MonthsKeys();
    const dataset = [];

    for (const monthKey of monthKeys) {
    const monthData = data.find(({ x }) => format(new Date(x), 'MMM yyyy') === monthKey);
    if (monthData) {
    dataset.push(monthData.y);
    } else {
    dataset.push(0);
    }
}

return dataset;
};

const ViewBookBarChart = ({ aggregatedData }: ViewBarChartProps) => {
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const dataset = matchDataToMonths(aggregatedData);
  const labelset = dataset.map((_, index) => {
    const date = subMonths(new Date(), index);
    return format(startOfMonth(date), 'MMM');
  });
  const dataValues = dataset;
  const maxY = Math.max(...dataValues);

  const chartData = {
    labels: labelset.reverse(),
    datasets: [
      {
        data: dataValues,
      },
    ],
  };

  const handleChartPress = () => {
    setTooltipPos((previousState) => ({
      ...previousState,
      visible: false,
    }));
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleChartPress}>
      <View style={styles.chartContainer}>
        <BarChart
        //   onDataPointClick={(data) => {
        //     const isSamePoint =
        //       tooltipPos.x === data.x && tooltipPos.y === data.y;

        //     isSamePoint
        //       ? setTooltipPos((previousState) => {
        //           return {
        //             ...previousState,
        //             value: data.value,
        //             visible: !previousState.visible,
        //           };
        //         })
        //       : setTooltipPos({
        //           x: data.x,
        //           y: data.y,
        //           value: data.value,
        //           visible: true,
        //         });
        //   }}
          data={chartData}
          width={Dimensions.get("window").width + 40} // from react-native
          height={220}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientFromOpacity: 1,
            backgroundGradientTo: "#FFFFFF",
            backgroundGradientToOpacity: 1,
            color: (opacity = 1) => `rgba(251, 109, 11, ${opacity})`,
            style: {
              borderRadius: 0,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
            propsForLabels: {
                fontSize: "12",
                fill: "#FB6D0B",
            },
          }}
          withHorizontalLabels={false}
          showValuesOnTopOfBars={true}
          withInnerLines={false}
          style={styles.barChart}
        />
      </View>
      {tooltipPos.visible && (
        <View
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y - 30,
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Text>{tooltipPos.value} books</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    overflow: 'hidden',
    paddingRight: 20,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -55,
  },
});

export default ViewBookBarChart;