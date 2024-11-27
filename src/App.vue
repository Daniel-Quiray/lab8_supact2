  <template>
    <div>
      <h1>Real-Time Sensor Data</h1>
      <p>Temperature: {{ temperature }} °C</p>
      <p>Humidity: {{ humidity }} %</p>
    </div>
  </template>

  <script>
  import { connectMQTT, subscribeToTopic } from "@/services/mqttService.js";

  export default {
    data() {
      return {
        temperature: "N/A",
        humidity: "N/A",
      };
    },
    created() {
      // Connect to the MQTT broker
      const brokerUrl = "wss://afaa0f734cd84cde99cb322749b774f8.s1.eu.hivemq.cloud"; // Use WebSocket for browser compatibility

      // MQTT options (replace with your credentials)
      const options = {
        username: "dave123",
        password: "Dave12345",
        clean: true, // Optional (whether to clean session after disconnect)
      };

      // Connect to MQTT
      connectMQTT(brokerUrl, options);

      // Subscribe to temperature and humidity topics
      subscribeToTopic("sensors/temp", (message) => {
        this.temperature = message;
      });
      subscribeToTopic("sensors/humidity", (message) => {
        this.humidity = message;
      });
    },
  };
  </script>

  <style scoped>
  /* Add any component-specific styles here */
  </style>
