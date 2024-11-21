import { format, startOfMonth, subMonths } from "date-fns";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { BOOKWORM_ORANGE } from "../../constants/constants";
import { type MonthDataPointModel } from "../../types";

interface ViewBarChartProps {
  aggregatedData: MonthDataPointModel[];
}

/**
 * Method for retrieving the last six months to act as x axis labels
 * @returns the last 6 months in the format 'MMM yyyy'
 */
const getLast6MonthsKeys = () => {
  const monthKeys = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const startOfMonthDate = startOfMonth(subMonths(today, i));
    monthKeys.push(format(startOfMonthDate, "MMM yyyy"));
  }
  return monthKeys.reverse();
};

/**
 * Method for matching the data to the last 6 months so that
 * months that did not have entries have 0 vals
 * @param data dataset of books finished with corresponding dates
 * @returns the dataset of the matched data
 */
const matchDataToMonths = (data: MonthDataPointModel[]) => {
  const monthKeys = getLast6MonthsKeys();
  const dataset = [];

  for (const monthKey of monthKeys) {
    const monthData = data.find(
      ({ x }) => format(new Date(x), "MMM yyyy") === monthKey,
    );
    if (monthData != null) {
      dataset.push(monthData.y);
    } else {
      dataset.push(0);
    }
  }

  return dataset;
};

const ViewBookBarChart = ({ aggregatedData }: ViewBarChartProps) => {
  const dataset = matchDataToMonths(aggregatedData);

  const labelset = dataset.map((_, index) => {
    const date = subMonths(new Date(), index);
    return format(startOfMonth(date), "MMM");
  });
  const dataValues = dataset;

  const chartData = {
    labels: labelset.reverse(),
    datasets: [
      {
        data: dataValues,
      },
    ],
  };

  return (
    <TouchableOpacity activeOpacity={1}>
      <View style={styles.chartContainer}>
        <BarChart
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
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
            propsForLabels: {
              fontSize: "12",
              fill: BOOKWORM_ORANGE,
            },
          }}
          withHorizontalLabels={false}
          showValuesOnTopOfBars={true}
          withInnerLines={false}
          style={styles.barChart}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    overflow: "hidden",
    paddingRight: 20,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -55,
  },
});

export default ViewBookBarChart;
