import { Fragment, useEffect, useState } from "react";
import useClickOutside from "../../useClickOutside";
import { timeouts, videoHosts } from "../../constants";

const VideoPopup_ = ({ close, videoID }) => {
  let domNode = useClickOutside(() => {
    close(false);
  });
  return (
    <Fragment>
      <div className="mfp-bg mfp-ready" onClick={() => close(false)}></div>
      <div
        className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-ready popup-overlay"
        tabIndex={-1}
      >
        <div className="mfp-container mfp-s-ready mfp-iframe-holder">
          <div className="mfp-content" ref={domNode}>
            <div className="mfp-iframe-scaler">
              <button
                title="Close (Esc)"
                type="button"
                className="mfp-close"
                onClick={() => close()}
              >
                ×
              </button>
              <iframe
                src={videoID}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="mfp-preloader">Loading...</div>
        </div>
      </div>
    </Fragment>
  );
};

const VideoPopup = () => {
  const [video, setVideo] = useState(false);
  const [videoValue, setVideoValue] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      const a = document.querySelectorAll("a");
      a.forEach((a) => {
        if (
          a.href.includes(videoHosts.youtube) ||
          a.href.includes(videoHosts.vimeo) ||
          a.href.includes(videoHosts.soundcloud)
        ) {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            setVideoValue(a.href);
            setVideo(true);
            let href = a.href;
            if (href.includes("youtube")) {
              setVideoValue(
                `//www.youtube.com/embed/${href.split("=")[1]}?autoplay=1`,
              );
            } else if (href.includes("vimeo")) {
              let splitData = href.split("/");
              setVideoValue(
                `//player.vimeo.com/video/${
                  splitData[splitData.length - 1]
                }?autoplay=1`,
              );
            } else {
              setVideoValue(href);
            }
          });
        }
      });
    }, timeouts.linkInterceptDelayMs);
  }, []);
  return (
    <Fragment>
      {video && (
        <VideoPopup_ close={() => setVideo(false)} videoID={videoValue} />
      )}
    </Fragment>
  );
};

export default VideoPopup;
