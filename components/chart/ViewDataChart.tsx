import { format, subWeeks } from "date-fns";
import React, { useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Rect, Svg, Text as TextSVG } from "react-native-svg";
import { type WeekDataPointModel } from "../../types";

interface ViewDataChartProps {
  aggregatedData: WeekDataPointModel[];
}

const date = new Date();

const startOfWeek = new Date(
  date.getFullYear(),
  date.getMonth(),
  date.getDate() - date.getDay(),
);

const weekKeys: string[] = [];
for (let i = 0; i < 8; i++) {
  const weekStart = subWeeks(startOfWeek, i);
  weekKeys.push(format(weekStart, "MMM dd"));
}
weekKeys.reverse();

const matchDataToWeeks = (data: WeekDataPointModel[]) => {
  const dataset = [];

  for (const weekKey of weekKeys) {
    const weekData = data.find(({ x }) => format(x, "MMM dd") === weekKey);
    if (weekData != null) {
      dataset.push(weekData.y);
    } else {
      dataset.push(0);
    }
  }
  return dataset;
};

const ViewDataChart = ({ aggregatedData }: ViewDataChartProps) => {
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const dataset = matchDataToWeeks(aggregatedData);

  const chartData = {
    labels: weekKeys,
    datasets: [
      {
        data: dataset,
      },
    ],
  };

  // TODO: handle. Clicking anywhere should disable the modal
  const handleChartPress = () => {
    setTooltipPos((previousState) => ({
      ...previousState,
      visible: false,
    }));
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleChartPress}>
      <LineChart
        onDataPointClick={(data) => {
          const isSamePoint =
            tooltipPos.x === data.x && tooltipPos.y === data.y;

          isSamePoint
            ? setTooltipPos((previousState) => {
                return {
                  ...previousState,
                  value: data.value,
                  visible: !previousState.visible,
                };
              })
            : setTooltipPos({
                x: data.x,
                value: data.value,
                y: data.y,
                visible: true,
              });
        }}
        data={chartData}
        width={Dimensions.get("window").width + 40} // from react-native
        height={220}
        fromZero={true}
        yAxisLabel="" // Ensuring it's empty to not append text
        yAxisSuffix="" // Also ensuring no suffix is added
        // yAxisInterval={increment} // Set dynamically based on data
        withVerticalLines={false}
        chartConfig={{
          decimalPlaces: 0,
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientFromOpacity: 1,
          backgroundGradientTo: "#FFFFFF",
          backgroundGradientToOpacity: 1,
          color: (opacity = 1) => `rgba(251, 109, 11, ${opacity})`,
          strokeWidth: 2,
          barPercentage: 0.5,
          useShadowColorFromDataset: false,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            fill: "#FB6D0B",
            strokeWidth: "2",
          },
          propsForLabels: {
            fontSize: "12",
            fill: "#FB6D0B",
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -16,
        }}
        formatXLabel={(x) => {
          const day = parseInt(x.slice(4, 6), 10);
          return day > 7 ? "" : x.slice(0, 3);
        }}
        decorator={() => {
          // TODO FIX THIS DECORATOR TO HANDLE CLICK OFF
          return tooltipPos.visible ? (
            <View style={{ alignContent: "center", justifyContent: "center" }}>
              <Svg>
                <Rect
                  x={tooltipPos.x - 15}
                  y={tooltipPos.y + 10}
                  width="40"
                  height="30"
                  fill="#FB6D0B"
                  rx={5} // Horizontal border radius
                  ry={5} // Vertical border radius
                />
                <TextSVG
                  x={tooltipPos.x + 5}
                  y={tooltipPos.y + 30}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {tooltipPos.value}
                </TextSVG>
              </Svg>
            </View>
          ) : null;
        }}
      />
    </TouchableOpacity>
  );
};

export default ViewDataChart;
