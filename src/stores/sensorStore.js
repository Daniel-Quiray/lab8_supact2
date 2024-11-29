import { defineStore } from "pinia";

export const useSensorStore = defineStore("sensor", {
  state: () => ({
    sensorData: {},
    thresholds: {
      temperature: { low: 20, high: 35 },
      humidity: { low: 30, high: 70 },
    },
    alerts: [],
  }),
  actions: {
    updateSensorData(topic, value) {
      if (topic === "sensor/temp") {
        this.sensorData.temperature = value;
        this.checkThreshold("temperature", value);
      } else if (topic === "sensor/humidity") {
        this.sensorData.humidity = value;
        this.checkThreshold("humidity", value);
      }
    },
    checkThreshold(type, value) {
      const { low, high } = this.thresholds[type];
      if (value > high) {
        this.addAlert(`High ${type.charAt(0).toUpperCase() + type.slice(1)} Alert: ${value}`);
      } else if (value < low) {
        this.addAlert(`Low ${type.charAt(0).toUpperCase() + type.slice(1)} Alert: ${value}`);
      }
    },
    addAlert(message) {
      this.alerts.push(message);
    },
    dismissAlert(index) {
      this.alerts.splice(index, 1);
    },
    updateThresholds(type, low, high) {
      this.clearAlerts(); // Clear alerts when thresholds are updated
      this.thresholds[type] = { low, high };
    },
    clearAlerts() {
      this.alerts = []; // Clears all alerts
    },
  },
});
