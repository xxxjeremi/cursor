"use client";
import React, { useState, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import ApartmentOneComponent from "@/components/apartment/apartment1";
import ApartmentTwoComponent from "@/components/apartment/apartment2";
import CoffeeShopComponent from "@/components/coffee-shop";
import FitnessComponent from "@/components/fitness";
import LobbyComponent from "@/components/lobby";
import OfficeOneComponent from "@/components/office/office1";
import OfficeTwoComponent from "@/components/office/office2";
import SaunaComponent from "@/components/pool";
import RestaurantComponent from "@/components/restaurant";
import ShowroomComponent from "@/components/showroom";
import TerraceComponent from "@/components/terrace";
import LocationViewComponent from "@/components/location";
import Script from "next/script";

const Dropdown = ({ buttonLabel, items, isOpen, onToggle }) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="bg-white bg-opacity-20 text-white px-4 py-2 rounded hover:bg-opacity-30 transition-all duration-200"
    >
      {buttonLabel}
    </button>
    {isOpen && (
      <div className="absolute left-0 mt-2 w-48 bg-white bg-opacity-90 rounded-lg shadow-lg py-1 z-10">
        {items.map((item, index) => (
          <button
            key={index}
            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 transition-all duration-150"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

const SCRIPT_MAP = {
  lobby: "/lobby/lib/tdvplayer.js?v=1743992079882",
  coffeeshop: "/coffee_shop/lib/tdvplayer.js?v=1743695822812",
  restaurant: "/restaurant/lib/tdvplayer.js?v=1743683483968",
  sauna: "/sauna/lib/tdvplayer.js?v=1743693094219",
  office1: "/office1/lib/tdvplayer.js?v=1743591263553",
  office2: "/office2/lib/tdvplayer.js?v=1743592766902",
  apartment1: "/apartment1/lib/tdvplayer.js?v=1743582223752",
  apartment2: "/apartment2/lib/tdvplayer.js?v=1743587718932",
  showroom: "/showroom/lib/tdvplayer.js?v=1743694505538",
  fitness: "/fitness/lib/tdvplayer.js?v=1743739863709",
  terrace: "/terrace/lib/tdvplayer.js?v=1743574916908",
};

export default function HomePage() {
  const [activeView, setActiveView] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (activeView && SCRIPT_MAP[activeView]) {
      const script = document.createElement("script");
      script.src = SCRIPT_MAP[activeView];
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [activeView]);

  const toggleDropdown = useCallback((dropdown) => {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  }, []);

  const showView = useCallback(
    (view) => {
      if (activeView === view) {
        setActiveView(null);
        setIsScriptLoaded(false);
      } else {
        setActiveView(view);
        setIsScriptLoaded(false);
      }
      setOpenDropdown(null);
    },
    [activeView]
  );

  const A_BLOCK_ITEMS = [
    { label: "Лобби", onClick: () => showView("lobby") },
    { label: "Кофе шоп", onClick: () => showView("coffeeshop") },
    { label: "Ресторант", onClick: () => showView("restaurant") },
    { label: "Спа", onClick: () => showView("sauna") },
    { label: "Оффис 1", onClick: () => showView("office1") },
    { label: "Оффис 2", onClick: () => showView("office2") },
    { label: "Байр 1", onClick: () => showView("apartment1") },
    { label: "Байр 2", onClick: () => showView("apartment2") },
  ];

  const B_BLOCK_ITEMS = [
    { label: "Auto showroom", onClick: () => showView("showroom") },
    { label: "Фитнесс иога", onClick: () => showView("fitness") },
    { label: "Зэн цэцэрлэг", onClick: () => showView("terrace") },
  ];

  const LOCATION_ITEMS = [
    { label: "Байршил", onClick: () => showView("location") },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {activeView && SCRIPT_MAP[activeView] && (
        <Script
          src={SCRIPT_MAP[activeView]}
          strategy="beforeInteractive"
          onLoad={() => setIsScriptLoaded(true)}
        />
      )}
      <ReactPlayer
        url="/videos/background.mp4"
        playing
        loop
        muted
        width="100%"
        height="100%"
        className="object-cover absolute top-0 left-0 z-[1]"
        playsinline
      />
      <div className="absolute top-4 right-36 z-[3] flex space-x-2">
        <Dropdown
          buttonLabel="A блок"
          items={A_BLOCK_ITEMS}
          isOpen={openDropdown === "a"}
          onToggle={() => toggleDropdown("a")}
        />
        <Dropdown
          buttonLabel="B блок"
          items={B_BLOCK_ITEMS}
          isOpen={openDropdown === "b"}
          onToggle={() => toggleDropdown("b")}
        />
        <Dropdown
          buttonLabel="Байршил"
          items={LOCATION_ITEMS}
          isOpen={openDropdown === "location"}
          onToggle={() => toggleDropdown("location")}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-[4] h-[420px] w-[800px]">
        {activeView === "lobby" && isScriptLoaded && <LobbyComponent />}
        {activeView === "coffeeshop" && isScriptLoaded && (
          <CoffeeShopComponent />
        )}
        {activeView === "restaurant" && isScriptLoaded && (
          <RestaurantComponent />
        )}
        {activeView === "sauna" && isScriptLoaded && <SaunaComponent />}
        {activeView === "office1" && isScriptLoaded && <OfficeOneComponent />}
        {activeView === "office2" && isScriptLoaded && <OfficeTwoComponent />}
        {activeView === "apartment1" && isScriptLoaded && (
          <ApartmentOneComponent />
        )}
        {activeView === "apartment2" && isScriptLoaded && (
          <ApartmentTwoComponent />
        )}
        {activeView === "fitness" && isScriptLoaded && <FitnessComponent />}
        {activeView === "terrace" && isScriptLoaded && <TerraceComponent />}
        {activeView === "showroom" && isScriptLoaded && <ShowroomComponent />}
        {activeView === "location" && <LocationViewComponent />}
      </div>
    </div>
  );
}
