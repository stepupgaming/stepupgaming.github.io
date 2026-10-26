(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector("#site-nav");
  var menuLabel = document.querySelector(".menu-label");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ticking = false;

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateHeader();

  function setMenu(open) {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    if (header) header.classList.toggle("is-menu-open", open);
    if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 841px)");
    var closeOnDesktop = function (event) {
      if (event.matches) setMenu(false);
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", closeOnDesktop);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(closeOnDesktop);
    }
  }

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-link[href^="#"]')
  );
  var sectionIds = navLinks
    .map(function (link) {
      return link.getAttribute("href").slice(1);
    })
    .filter(Boolean);

  function setActiveSection(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sectionIds.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: 0 }
    );

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  if (sectionIds.indexOf("contact") !== -1) {
    var updateBottomNav = function () {
      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) setActiveSection("contact");
    };

    window.addEventListener("scroll", updateBottomNav, { passive: true });
    window.addEventListener("resize", updateBottomNav);
    updateBottomNav();
  }

  var revealElements = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealElements.length) {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      revealElements.forEach(function (element) {
        element.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );

      revealElements.forEach(function (element) {
        revealObserver.observe(element);
      });
    }
  }

  var video = document.querySelector(".hero-video");
  var videoToggle = document.querySelector(".video-toggle");
  var timeline = document.querySelector(".timeline");
  var currentTime = document.querySelector("[data-current]");
  var totalTime = document.querySelector("[data-total]");
  var toggleIcon = document.querySelector(".video-toggle-icon");
  var toggleText = document.querySelector(".video-toggle-text");

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatTimecode(seconds) {
    var safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
    var totalFrames = Math.floor(safeSeconds * 30);
    var frames = totalFrames % 30;
    var wholeSeconds = Math.floor(safeSeconds);
    var secs = wholeSeconds % 60;
    var mins = Math.floor(wholeSeconds / 60) % 60;
    var hours = Math.floor(wholeSeconds / 3600);
    return pad(hours) + ":" + pad(mins) + ":" + pad(secs) + ":" + pad(frames);
  }

  function setVideoState(playing) {
    if (!videoToggle) return;
    if (toggleIcon) toggleIcon.textContent = playing ? "\u275A\u275A" : "\u25B6";
    if (toggleText) toggleText.textContent = playing ? "Pause" : "Play";
    videoToggle.setAttribute(
      "aria-label",
      playing ? "Pause the director render" : "Play the director render"
    );
  }

  function updateTimeline() {
    if (!video) return;
    var duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 3;
    var progress = Math.min(Math.max(video.currentTime / duration, 0), 1);

    if (timeline) timeline.style.setProperty("--progress", progress.toFixed(4));
    if (currentTime) currentTime.textContent = formatTimecode(video.currentTime);
    if (totalTime) totalTime.textContent = formatTimecode(duration);
  }

  if (video) {
    if (prefersReducedMotion.matches) {
      video.removeAttribute("autoplay");
      video.pause();
      setVideoState(false);
    } else {
      setVideoState(!video.paused);
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(function () {
          setVideoState(false);
        });
      }
    }

    video.addEventListener("timeupdate", updateTimeline);
    video.addEventListener("play", function () {
      setVideoState(true);
    });
    video.addEventListener("pause", function () {
      setVideoState(false);
    });
    video.addEventListener("loadedmetadata", updateTimeline);
    video.addEventListener("error", function () {
      if (videoToggle) videoToggle.hidden = true;
      if (totalTime) totalTime.textContent = "00:00:00:00";
    });

    if (videoToggle) {
      videoToggle.addEventListener("click", function () {
        if (video.paused) {
          var playAttempt = video.play();
          if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(function () {
              setVideoState(false);
            });
          }
        } else {
          video.pause();
        }
      });
    }

    updateTimeline();

    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener("change", function (event) {
        if (event.matches) {
          video.pause();
        }
      });
    }
  }

  var copyButton = document.querySelector(".copy-email");

  function fallbackCopy(text) {
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "readonly");
    helper.style.position = "fixed";
    helper.style.top = "-1000px";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    var copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(helper);
    return copied;
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = copyButton.getAttribute("data-email") || "";
      var originalLabel = "Copy email";

      function showCopied() {
        copyButton.textContent = "Copied";
        copyButton.classList.add("is-copied");
        window.setTimeout(function () {
          copyButton.textContent = originalLabel;
          copyButton.classList.remove("is-copied");
        }, 2000);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          if (fallbackCopy(email)) showCopied();
        });
      } else if (fallbackCopy(email)) {
        showCopied();
      }
    });
  }

  var agentVideo = document.querySelector(".agent-video");
  if (agentVideo) {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      agentVideo.controls = true;
    } else {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              agentVideo.play().catch(function () {
                agentVideo.controls = true;
              });
            } else {
              agentVideo.pause();
            }
          });
        },
        { threshold: 0.4 }
      ).observe(agentVideo);
    }
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
