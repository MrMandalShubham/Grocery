"use client";

import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon missing issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: L.LatLng; setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  );
}

export default function MapPicker({
  defaultLocation = { lat: 19.0760, lng: 72.8777 }, // Mumbai default
  onConfirm
}: {
  defaultLocation?: { lat: number, lng: number };
  onConfirm: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng>(new L.LatLng(defaultLocation.lat, defaultLocation.lng));
  const mapRef = useRef<L.Map>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden border-2 border-line relative z-0">
        <MapContainer 
          center={position} 
          zoom={12} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <button
        onClick={() => onConfirm(position.lat, position.lng)}
        className="w-full bg-green-deep text-white font-bold py-3 rounded-xl hover:bg-green transition shadow-md"
      >
        Confirm Map Location
      </button>
    </div>
  );
}
