<template>
  <div>
    <h1>Real-Time Sensor Data</h1>
    <p>Temperature: {{ sensorData.temperature }} °C</p>
    <p>Humidity: {{ sensorData.humidity }} %</p>
  </div>
</template>

<script>
// Import the Pinia store and MQTT service
import { useSensorStore } from "@/stores/sensorStore";
import { connectMQTT, subscribeToTopic } from "@/services/mqttService.js";

export default {
  setup() {
    // Use the Pinia store
    const sensorStore = useSensorStore();

    // MQTT broker URL and options
    const brokerUrl = "wss://afaa0f734cd84cde99cb322749b774f8.s1.eu.hivemq.cloud";
    const options = {
      username: "dave123",
      password: "Dave12345",
      clean: true,
    };

    // Connect to the MQTT broker
    connectMQTT(brokerUrl, options);

    // Subscribe to the temperature and humidity topics
    subscribeToTopic("sensors/temp", (message) => {
      sensorStore.setTemperature(message);  // Update Pinia store
    });
    subscribeToTopic("sensors/humidity", (message) => {
      sensorStore.setHumidity(message);  // Update Pinia store
    });

    return {
      sensorData: sensorStore.sensorData,  // Access data from Pinia store
    };
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
