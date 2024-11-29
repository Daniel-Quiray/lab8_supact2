<template>
  <div class="container-fluid" style="height: 100vh; padding: 20px;">
    <div class="row">
      <!-- Main Section -->
      <div class="col-12 col-md-8">
        <h1 class="mb-4">MQTT Logger with ECharts</h1>
        <button @click="connect" class="btn btn-primary mb-4">
          Connect and Subscribe
        </button>

        <!-- Threshold Settings -->
        <div class="mb-4">
          <h3>Set Custom Thresholds</h3>
          <div class="row mb-3">
            <div class="col-6">
              <label for="temp-low">Temperature Low:</label>
              <input
                type="number"
                id="temp-low"
                v-model.number="thresholds.temperature.low"
                @change="updateThresholds('temperature')"
                class="form-control"
              />
            </div>
            <div class="col-6">
              <label for="temp-high">Temperature High:</label>
              <input
                type="number"
                id="temp-high"
                v-model.number="thresholds.temperature.high"
                @change="updateThresholds('temperature')"
                class="form-control"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-6">
              <label for="hum-low">Humidity Low:</label>
              <input
                type="number"
                id="hum-low"
                v-model.number="thresholds.humidity.low"
                @change="updateThresholds('humidity')"
                class="form-control"
              />
            </div>
            <div class="col-6">
              <label for="hum-high">Humidity High:</label>
              <input
                type="number"
                id="hum-high"
                v-model.number="thresholds.humidity.high"
                @change="updateThresholds('humidity')"
                class="form-control"
              />
            </div>
          </div>
        </div>

        <!-- Alerts Section -->
        <div v-if="alerts.length" class="mb-4">
          <div
            v-for="(alert, index) in alerts"
            :key="index"
            class="alert alert-danger d-flex justify-content-between align-items-center"
          >
            <span>{{ alert }}</span>
            <button
              @click="dismissAlert(index)"
              class="close"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>

        <!-- Chart Container -->
        <div id="mqttChart" class="border rounded shadow"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSensorStore } from "../stores/sensorStore";
import * as echarts from "echarts";
import mqttService from "../services/mqttService";

export default {
  data() {
    return {
      chart: null,
    };
  },
  computed: {
    sensorStore() {
      return useSensorStore();
    },
    thresholds() {
      return this.sensorStore.thresholds;
    },
    alerts() {
      return this.sensorStore.alerts;
    },
  },
  methods: {
    connect() {
      mqttService.connectAndSubscribe(
        (message) => {
          const { topic, payload } = message;
          const value = Number(payload);
          this.sensorStore.updateSensorData(topic, value);
          this.updateChart(topic, value);
        },
        (error) => console.error("MQTT Error:", error)
      );
    },
    initializeChart() {
      const chartContainer = document.getElementById("mqttChart");
      this.chart = echarts.init(chartContainer);
      this.chart.setOption({
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: [
          { name: "Temperature (°C)", type: "line", data: [], smooth: true },
          { name: "Humidity (%)", type: "line", data: [], smooth: true },
        ],
      });
    },
    updateChart(topic, value) {
      const timestamp = new Date().toLocaleTimeString();
      const xAxisData = this.chart.getOption().xAxis[0].data;
      const temperatureData = this.chart.getOption().series[0].data;
      const humidityData = this.chart.getOption().series[1].data;

      if (topic === "sensor/temp") {
        temperatureData.push(value);
      } else if (topic === "sensor/humidity") {
        humidityData.push(value);
      }

      this.chart.setOption({
        xAxis: {
          data: [...xAxisData, timestamp].slice(-20),
        },
        series: [
          {
            data: temperatureData.slice(-20),
          },
          {
            data: humidityData.slice(-20),
          },
        ],
      });
    },
    updateThresholds(type) {
      const { low, high } = this.thresholds[type];
      this.sensorStore.updateThresholds(type, low, high);
      this.sensorStore.clearAlerts();
    },
    dismissAlert(index) {
      this.sensorStore.dismissAlert(index);
    },
  },
  mounted() {
    this.initializeChart();
  },
};
</script>

<style scoped>
/* Base Styles */
body {
  background-color: #f5f8fa;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

/* Main Container */
.container-fluid {
  padding: 30px;
}

/* Header */
h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #4e73df;
  margin-bottom: 30px;
  text-align: center;
}

/* Button Styling */
button {
  background-color: #4e73df;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1.1rem;
  border-radius: 50px;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: scale(1.05);
  background-color: #2e59d9;
}

button:focus {
  outline: none;
}

/* Threshold Settings Section */
.mb-4 {
  margin-bottom: 40px;
}

h3 {
  font-size: 1.8rem;
  font-weight: 500;
  color: #1c1c1c;
  margin-bottom: 20px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f1f3f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: border-color 0.3s ease;
  width: 100%;
}

input:focus {
  border-color: #4e73df;
  background-color: #fff;
  outline: none;
}

/* Alerts Section */
.alert {
  font-size: 1rem;
  font-weight: 500;
  background-color: #e74a3b;
  color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.alert .close {
  background: none;
  border: none;
  color: white;
  font-size: 1.4rem;
  cursor: pointer;
}

/* Chart Section */
#mqttChart {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Input Group (for layout) */
.row {
  margin-bottom: 20px;
}

/* Custom styling for form inputs (labels and columns) */
input {
  background-color: #f1f3f5;
  border-radius: 8px;
}

label {
  font-weight: 500;
  font-size: 1.1rem;
  color: #5a5c69;
}

.col-6 {
  margin-bottom: 20px;
}

.col-6 input {
  font-size: 1.1rem;
}

/* Card-like Layout for Inputs and Alerts */
.card {
  background-color: #fff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 25px;
  margin-top: 20px;
  border: none;
}

/* Card Heading */
.card h3 {
  color: #4e73df;
}

/* Smooth Hover Effects */
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Flexbox alignment for the layout */
.d-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.d-flex .btn {
  margin-top: 0;
}

/* Margin tweaks for various sections */
.mb-4 {
  margin-bottom: 40px;
}

.mt-4 {
  margin-top: 40px;
}

.mb-3 {
  margin-bottom: 30px;
}

/* Dropdown and Input Styling for Thresholds */
input[type="number"] {
  height: 45px;
  font-size: 1.1rem;
  margin-top: 5px;
}

input[type="number"]:focus {
  box-shadow: 0 0 8px rgba(79, 115, 223, 0.6);
}

/* General Text Colors */
.text-muted {
  color: #6c757d !important;
}

.text-primary {
  color: #4e73df;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .container-fluid {
    padding: 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .col-6 {
    padding: 0 15px;
  }
}
</style>

