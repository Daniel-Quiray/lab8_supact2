<template>
  <div style="display: flex; height: 100vh">
    <!-- Main Section -->
    <div style="flex: 1; padding: 20px">
      <h1>MQTT Logger with ECharts</h1>
      <button @click="connect" style="margin-bottom: 20px">
        Connect and Subscribe
      </button>
      <!-- Chart Container -->
      <div
        style="
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          padding: 20px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="margin-bottom: 20px; text-align: center">Sensor Data</h2>
        <div id="mqttChart" style="width: 100%; height: 400px"></div>
      </div>
    </div>
    <!-- Right Sidebar for Logs -->
    <div
      style="
        width: 300px;
        background: #f7f7f7;
        border-left: 1px solid #ddd;
        overflow-y: auto;
      "
    >
      <h2 style="text-align: center; margin: 10px 0">Logs</h2>
      <ul style="padding: 10px; list-style: none; font-size: 14px">
        <li
          v-for="(log, index) in logs"
          :key="index"
          style="margin-bottom: 8px"
        >
          <span>{{ log }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import mqttService from "../services/mqttService";
import * as echarts from "echarts";

export default {
  data() {
    return {
      logs: [], // Array to hold logs
      chart: null, // ECharts instance
      chartOptions: {
        xAxis: {
          type: "category",
          data: [], // Timestamps for X-axis
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Temperature (°C)",
            type: "line",
            data: [], // Temperature data
            smooth: true,
            color: "#ff6384",
          },
          {
            name: "Humidity (%)",
            type: "line",
            data: [], // Humidity data
            smooth: true,
            color: "#36a2eb",
          },
        ],
      },
    };
  },
  methods: {
    addLog(message) {
      this.logs.push(message);
      if (this.logs.length > 50) this.logs.shift(); // Keep last 50 logs
    },
    initializeChart() {
      const chartContainer = document.getElementById("mqttChart");
      this.chart = echarts.init(chartContainer);
      // Set initial options
      this.chart.setOption(this.chartOptions);
    },
    updateChart(topic, payload) {
      const timestamp = new Date().toLocaleTimeString();
      // Update X-axis data
      this.chartOptions.xAxis.data.push(timestamp);
      if (this.chartOptions.xAxis.data.length > 20) {
        this.chartOptions.xAxis.data.shift(); // Limit to 20 data points
      }
      // Update series data
      if (topic === "sensors/temp") {
        this.chartOptions.series[0].data.push(Number(payload)); // Temperature
        if (this.chartOptions.series[0].data.length > 20) {
          this.chartOptions.series[0].data.shift();
        }
      } else if (topic === "sensors/humidity") {
        this.chartOptions.series[1].data.push(Number(payload)); // Humidity
        if (this.chartOptions.series[1].data.length > 20) {
          this.chartOptions.series[1].data.shift();
        }
      }
      // Refresh the chart
      this.chart.setOption(this.chartOptions);
    },
    connect() {
      this.addLog("Connecting to MQTT broker...");
      mqttService.connectAndSubscribe(
        (message) => {
          const { topic, payload } = message;
          this.addLog(`Received: Topic=${topic}, Payload=${payload}`);
          this.updateChart(topic, payload);
        },
        (error) => {
          this.addLog(`Connection error: ${error.message}`);
        }
      );
    },
  },
  mounted() {
    this.initializeChart();
  },
};
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  margin-bottom: 10px;
}
button:hover {
  background: #0056b3;
}
canvas {
  margin-top: 20px;
}
li {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid #ddd;
  word-wrap: break-word;
}
</style>
