<!DOCTYPE html>
<html>
  <head>
    <title>Vehicle Data</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    <script>
      // Add your Telegram bot token here
      const botToken = "6951961231:AAHPyJ5awRIAZ8B7ZDahNisN8OeO9AFNBQs";
      // Add the chat ID where you want to send the message
      const chatId = "-4049776102";

      function sendMessageToTelegram(message) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }).catch((error) => console.error("Error:", error));
      }

      const table = document.createElement("table");

      // Create a header row
      const headerRow = document.createElement("tr");
      [
        "Name",
        "Speed",
        "Time",
        "Latitude",
        "Longitude",
        "location Name",
        "Status",
      ].forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      let totalVehicles = 0;
      let alertSent = false;
      function checkVehicleSpeed() {
        fetch(
          "http://fleettrack.africa/api/get_devices?user_api_hash=$2y$10$uoJI9ojaB0pNlXCtzfm8M.7x38Z8Xu1rH6uFQ.wVYcwOmgVCUkojK"
        )
          .then((response) => response.json())
          .then((data) => {
            let alertedVehicles = new Set();
            data.forEach((group) => {
              totalVehicles += group.items.length;
              group.items.forEach(async (item) => {
                const googleMapsLink = `https://www.google.com/maps/?q=${item.lat},${item.lng}`;
                const row = document.createElement("tr");
                ["name", "speed", "time", "lat", "lng"].forEach((key) => {
                  const cell = document.createElement("td");
                  cell.textContent = item[key];
                  if (key === "lat" || key === "lng") {
                    cell.className = "coordinates";
                  }
                  row.appendChild(cell);
                });

                // Fetch the location name using the Google Maps Geocoding API
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${item.lat},${item.lng}&key=AIzaSyCmQSc-YZPMwcf5mR-YH2pkDpPmn8jmCX4`
                );
                const data = await response.json();
                const locationName = data.results[0].formatted_address;

                // Create a new cell for the location name
                const locationCell = document.createElement("td");
                locationCell.textContent = locationName;
                row.appendChild(locationCell);

                // Add a status cell
                const statusCell = document.createElement("td");
                const isDriving = item.speed > 10;
                statusCell.textContent = isDriving ? "Driving" : "Not Driving";
                row.appendChild(statusCell);
                // Create a set to store the names of the vehicles for which an alert has been sent
                const alertedVehicles = new Set();
                // Check if the vehicle is driving at 16:50
                let currentTime = new Date();
                let givenTime = new Date();
                givenTime.setHours(11, 28); // Set the given time to 3:19 PM
                // Assuming address and googleMapsLink are available in the item object
                if (
                  isDriving &&
                  currentTime.getHours() === givenTime.getHours() &&
                  currentTime.getMinutes() === givenTime.getMinutes() &&
                  !alertedVehicles.has(item.name)
                ) {
                  sendMessageToTelegram(
                    `${item.name} is driving 18:00 to 06:00 (GMT 3) at ${item.time}. near ${locationName}. Google Maps link: ${googleMapsLink}`
                  );
                  alertedVehicles.add(item.name);
                }

                table.appendChild(row);
              });
            });

            // Create a paragraph to display the total number of vehicles
            const totalVehiclesParagraph = document.createElement("p");
            totalVehiclesParagraph.textContent = `Total number of vehicles: ${totalVehicles}`;

            // Append the paragraph and the table to the body of the document
            document.body.appendChild(totalVehiclesParagraph);
            document.body.appendChild(table);
          })
          .catch((error) => console.error("Error:", error));
      }

      checkVehicleSpeed();
    </script>
  </body>
</html>
