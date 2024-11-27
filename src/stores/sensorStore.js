// src/stores/sensorStore.js
import { defineStore } from 'pinia';

export const useSensorStore = defineStore('sensor', {
  state: () => ({
    sensorData: {
      temperature: 'N/A',
      humidity: 'N/A',
    },
  }),
  actions: {
    setTemperature(temperature) {
      this.sensorData.temperature = temperature;
    },
    setHumidity(humidity) {
      this.sensorData.humidity = humidity;
    },
  },
});
