"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fixing marker icon issue in Next.js
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Custom Marker Icon
const customIcon = new L.Icon({
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// List of predefined locations or use random ones
const generateRandomLocations = (count: number) => {
  return Array.from({ length: count }, () => ({
    latitude: 12.9 + Math.random() * 0.2,
    longitude: 77.5 + Math.random() * 0.2,
    label: "Bounty Available ★",
  }));
};

// Component Props
interface MapComponentProps {
  locations?: { latitude: number; longitude: number; label: string }[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  locations = generateRandomLocations(5),
}) => {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.latitude, loc.longitude]}
            icon={customIcon}
          >
            <Popup>{loc.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
