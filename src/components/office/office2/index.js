import React, { useEffect, useRef } from "react";
import Head from "next/head";
import Script from "next/script";

const OfficeTwoComponent = () => {
  const viewerRef = useRef(null);

  useEffect(() => {
    window.onLoad = function () {
      if (
        /AppleWebKit/.test(navigator.userAgent) &&
        /Mobile\/\w+/.test(navigator.userAgent)
      ) {
        var inIFrame = false;
        try {
          inIFrame = window.self !== window.top;
        } catch (e) {
          inIFrame = true;
        }
        if (!inIFrame) {
          const onResize = function (async) {
            [0, 250, 1000, 2000].forEach(function (delay) {
              setTimeout(function () {
                var viewer = document.querySelector("#viewer");
                var scale =
                  window.innerWidth / document.documentElement.clientWidth;
                var width = document.documentElement.clientWidth;
                var height = Math.round(window.innerHeight / scale);
                viewer.style.width = width + "px";
                viewer.style.height = height + "px";
                viewer.style.left =
                  Math.round((window.innerWidth - width) * 0.5) + "px";
                viewer.style.top =
                  Math.round((window.innerHeight - height) * 0.5) + "px";
                viewer.style.transform = "scale(" + scale + ", " + scale + ")";
                window.scrollTo(0, 0);
              }, delay);
            });
          };
          window.addEventListener("resize", onResize);
          onResize();
        }
      }
      showPreloader();
      loadTour();
    };
    let player;
    let playersPlayingTmp = [];
    let isInitialized = false;
    let isPaused = false;

    function loadTour() {
      if (player) return;

      const beginFunc = function (event) {
        if (event.name == "begin") {
          const camera = event.data.source.get("camera");
          if (
            camera &&
            camera.get("initialSequence") &&
            camera.get("initialSequence").get("movements").length > 0
          )
            return;
        }

        if (event.sourceClassName == "MediaAudio") return;

        isInitialized = true;

        player.unbind("preloadMediaShow", beginFunc, player, true);
        player.unbindOnObjectsOf(
          "PanoramaPlayListItem",
          "begin",
          beginFunc,
          player,
          true
        );
        player.unbind("stateChange", beginFunc, player, true);
        window.parent.postMessage("tourLoaded", "*");

        disposePreloader();
        onVirtualTourLoaded();
      };

      const settings = new window.TDV.PlayerSettings();
      settings.set(
        window.TDV.PlayerSettings.CONTAINER,
        document.getElementById("viewer")
      );
      settings.set(
        window.TDV.PlayerSettings.SCRIPT_URL,
        "/office2/script.js?v=1743592766902"
      );
      settings.set(
        window.TDV.PlayerSettings.WEBVR_POLYFILL_URL,
        "/office2/lib/WebVRPolyfill.js?v=1743592766902"
      );
      settings.set(
        window.TDV.PlayerSettings.HLS_URL,
        "/office2/lib/Hls.js?v=1743592766902"
      );
      settings.set(
        window.TDV.PlayerSettings.QUERY_STRING_PARAMETERS,
        "v=1743592766902"
      );

      window.tdvplayer = player = window.TDV.PlayerAPI.create(settings);
      player.bind("preloadMediaShow", beginFunc, player, true);
      player.bind("stateChange", beginFunc, player, true);
      player.bindOnObjectsOf(
        "PanoramaPlayListItem",
        "begin",
        beginFunc,
        player,
        true
      );
      player.bindOnObject(
        "rootPlayer",
        "start",
        function (e) {
          const queryDict = {};
          location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
              const k = item.split("=")[0],
                v = decodeURIComponent(item.split("=")[1]);
              queryDict[k] = v;
            });

          let item = undefined;
          if ("media-index" in queryDict) {
            item = setMediaByIndex(parseInt(queryDict["media-index"]) - 1);
          } else if ("media-name" in queryDict) {
            item = setMediaByName(queryDict["media-name"]);
          } else {
            item = setMediaByIndex(0);
          }

          if (item != undefined && "trigger-overlay-name" in queryDict) {
            triggerOverlayByName(
              item,
              queryDict["trigger-overlay-name"],
              "trigger-overlay-event" in queryDict
                ? queryDict["trigger-overlay-event"]
                : "click"
            );
          }

          player.getById("rootPlayer").bind(
            "tourEnded",
            function () {
              onVirtualTourEnded();
            },
            player,
            true
          );
        },
        player,
        false
      );
      window.addEventListener("message", function (e) {
        const action = e.data;
        if (action == "pauseTour" || action == "resumeTour") {
          this[action].apply(this);
        }
      });
    }

    function pauseTour() {
      isPaused = true;
      if (!isInitialized) return;

      const playLists = player.getByClassName("PlayList");
      for (let i = 0, count = playLists.length; i < count; i++) {
        const playList = playLists[i];
        const index = playList.get("selectedIndex");
        if (index != -1) {
          const item = playList.get("items")[index];
          const itemPlayer = item.get("player");
          if (itemPlayer && itemPlayer.pause) {
            playersPlayingTmp.push(itemPlayer);
            itemPlayer.pause();
          }
        }
      }

      player.getById("pauseGlobalAudios")();
    }

    function resumeTour() {
      isPaused = false;
      if (!isInitialized) return;

      while (playersPlayingTmp.length) {
        const viewer = playersPlayingTmp.pop();
        viewer.play();
      }

      player.getById("resumeGlobalAudios")();
    }

    function onVirtualTourLoaded() {
      if (isPaused) pauseTour();
    }

    function onVirtualTourEnded() {}

    function getRootPlayer() {
      return window.tdvplayer !== undefined
        ? window.tdvplayer.getById("rootPlayer")
        : undefined;
    }

    function setMediaByIndex(index) {
      const rootPlayer = getRootPlayer();
      if (rootPlayer !== undefined) {
        return rootPlayer.setMainMediaByIndex(index);
      }
    }

    function setMediaByName(name) {
      const rootPlayer = getRootPlayer();
      if (rootPlayer !== undefined) {
        return rootPlayer.setMainMediaByName(name);
      }
    }

    function triggerOverlayByName(item, name, eventName) {
      const rootPlayer = getRootPlayer();
      if (rootPlayer !== undefined) {
        item.bind(
          "begin",
          function (e) {
            item.unbind("begin", arguments.callee, this);
            const overlay = rootPlayer.getPanoramaOverlayByName(
              item.get("media"),
              name
            );
            if (overlay) rootPlayer.triggerOverlay(overlay, eventName);
          },
          rootPlayer
        );
      }
    }

    function showPreloader() {
      const preloadContainer = document.getElementById("preloadContainer");
      if (preloadContainer != undefined) preloadContainer.style.opacity = 1;
    }

    function disposePreloader() {
      const preloadContainer = document.getElementById("preloadContainer");
      if (preloadContainer == undefined) return;

      const transitionEndName = transitionEndEventName();
      if (transitionEndName) {
        preloadContainer.addEventListener(transitionEndName, hide, false);
        preloadContainer.style.opacity = 0;
        setTimeout(hide, 500);
      } else {
        hide();
      }

      function hide() {
        preloadContainer.style.visibility = "hidden";
        preloadContainer.style.display = "none";
      }

      function transitionEndEventName() {
        const el = document.createElement("div");
        const transitions = {
          transition: "transitionend",
          OTransition: "otransitionend",
          MozTransition: "transitionend",
          WebkitTransition: "webkitTransitionEnd",
        };

        for (let t in transitions) {
          if (el.style[t] !== undefined) {
            return transitions[t];
          }
        }

        return undefined;
      }
    }

    if (typeof window !== "undefined") {
      onLoad();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", window.messageHandler);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Coffee shop</title>
        <meta
          name="viewport"
          content="user-scalable=no, initial-scale=0.5, width=device-width, viewport-fit=cover"
        />
        <style>{`
          html, body { 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); 
          }
          #viewer { 
            background-color: #FFFFFF; 
            z-index: 1; 
            position: absolute; 
            width: 100%; 
            height: 100%; 
            top: 0; 
          }
          #preloadContainer { 
            z-index: 2; 
            position: relative; 
            width: 100%; 
            height: 100%; 
            transition: opacity 0.5s; 
            -webkit-transition: opacity 0.5s; 
            -moz-transition: opacity 0.5s; 
            -o-transition: opacity 0.5s;
          }
        `}</style>
      </Head>

      <Script
        src="/office2/lib/tdvplayer.js?v=1743592766902"
        strategy="beforeInteractive"
      />

      <div
        id="preloadContainer"
        style={{ backgroundColor: "rgba(255,255,255,1)" }}
      >
        <div
          style={{
            zIndex: 4,
            position: "absolute",
            left: "0%",
            top: "50%",
            width: "100.00%",
            height: "10.00%",
          }}
        >
          <div style={{ textAlign: "left", color: "#000" }}>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  letterSpacing: "0vmin",
                  color: "#777777",
                  fontSize: "1.48vmin",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                Loading virtual tour. Please wait...
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: "1.11vmin" }}>
              <br
                style={{
                  letterSpacing: "0vmin",
                  color: "#000000",
                  fontSize: "1.11vmin",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              />
            </p>
          </div>
        </div>
      </div>

      <div id="viewer" ref={viewerRef}></div>
    </>
  );
};

export default OfficeTwoComponent;
