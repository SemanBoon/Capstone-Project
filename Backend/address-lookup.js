const getGeocode = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data.length === 0) {
        console.error(`No geocode candidates found for address: ${address}`);
        throw new Error('Invalid address');
      }
      const location = {
        x: parseFloat(data[0].lon),
        y: parseFloat(data[0].lat)
      };
      return location;
    } catch (error) {
      console.error(`Error fetching geocode for address ${address}: ${error.message}`);
      throw new Error('Error fetching geocode');
    }
}

module.exports = {getGeocode}
