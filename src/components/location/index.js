import React from "react";
import ReactPlayer from "react-player";

export default function LocationViewComponent() {
  return (
    <ReactPlayer
      url="/videos/location/TOMO TOWER LOCATION.mp4"
      playing
      loop
      muted
      width="100%"
      height="100%"
      playsinline
    />
  );
}
