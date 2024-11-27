import mqtt from "mqtt";

let client = null;

// Connect to the MQTT broker       
export const connectMQTT = (brokerUrl, options = {}) => {
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error);
  });

  return client;
};

// Subscribe to an MQTT topic
export const subscribeToTopic = (topic, callback) => {
  if (!client) {
    console.error("MQTT client not connected!");
    return;
  }

  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic ${topic}:`, err);
    } else {
      console.log(`Subscribed to topic: ${topic}`);
    }
  });

  client.on("message", (receivedTopic, message) => {
    if (receivedTopic === topic) {
      callback(message.toString());
    }
  });
};

// Publish a message to an MQTT topic
export const publishToTopic = (topic, message) => {
  if (!client) {
    console.error("MQTT client not connected!");
    return;
  }

  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`Failed to publish to topic ${topic}:`, err);
    } else {
      console.log(`Message published to topic ${topic}: ${message}`);
    }
  });
};
