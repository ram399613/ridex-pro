const IMG = (id) => `https://images.unsplash.com/${id}?w=800&q=75&auto=format&fit=crop`;

const vehicleImages = {
  'Yamaha R15 V4':              IMG('photo-1568772585407-9361f9bf3a87'),
  'Honda Activa 6G':            IMG('photo-1622185135505-2d795003994a'),
  'Toyota Innova Crysta':       IMG('photo-1519641471654-76ce0107ad1b'),
  'Royal Enfield Classic 350':  IMG('photo-1558981806-ec527fa84c39'),
  'Maruti Swift':               IMG('photo-1494976388531-d1058494cdd8'),
  'KTM Duke 200':               IMG('photo-1449426468159-d96dbf08f19f'),
  'BMW 5 Series':               IMG('photo-1555215695-3004980ad54e'),
  'TVS Jupiter':                IMG('photo-1571068316344-75bc76f77890'),
  'Mercedes-Benz E-Class':      IMG('photo-1618843479313-40f8afb4b4d8'),
  'Honda CB Hornet 160R':       IMG('photo-1580310614729-ccd69652491d'),
  'Bajaj Pulsar 150':           IMG('photo-1580310614729-ccd69652491d'),
  'Suzuki Access 125':          IMG('photo-1600298881974-6be191ceeda1'),
  'Hero Splendor XTEC':         IMG('photo-1591637333184-19aa84b3e01f'),
  'Hyundai Creta':              IMG('photo-1541899481282-d53bffe3c35d'),
  'Tata Nexon':                 IMG('photo-1533473359331-0135ef1b58bf'),
  'Mahindra Thar':              IMG('photo-1533473359331-0135ef1b58bf'),
};

const fallbackByType = {
  bike:    IMG('photo-1558981806-ec527fa84c39'),
  scooter: IMG('photo-1571068316344-75bc76f77890'),
  car:     IMG('photo-1494976388531-d1058494cdd8'),
  luxury:  IMG('photo-1618843479313-40f8afb4b4d8'),
};

function imageFor(vehicle) {
  return vehicleImages[vehicle.name] || fallbackByType[vehicle.type] || fallbackByType.car;
}

module.exports = { vehicleImages, fallbackByType, imageFor };
