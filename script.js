/* ============================================================
   Portfolio — navigation, reveal, project previews, signature
   Signature playback is LOCKED — do not modify behavior.
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = "ontouchstart" in window || window.matchMedia("(pointer:coarse)").matches;

  /* ---------- NAV: scroll border ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  /* ---------- NAV: active link ---------- */
  var navLinks = document.querySelectorAll(".nav-links a, .nav-mobile a");
  var sectionIds = ["top","about","skills","projects","ai-projects","experience","certifications","contact"];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            link.classList.toggle("active", href === "#" + id);
          });
        }
      });
    }, { threshold: 0.28, rootMargin: "-20% 0px -60% 0px" });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- MOBILE NAV ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("navMobile");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- SCROLL REVEAL (subtle) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reducedMotion && revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- PROJECT HOVER PREVIEWS (desktop only) ---------- */
  var projectMediaEls = document.querySelectorAll(".project-media[data-video]");
  projectMediaEls.forEach(function (media) {
    var video = media.querySelector(".project-media-video");
    var videoSrc = media.dataset.video;
    if (!videoSrc || !video) return;
    // Only enable hover previews when a preview file actually exists
    fetch(videoSrc, { method: "HEAD" }).then(function (res) {
      if (!res.ok) return;
      if (isTouch) return;
      var loaded = false;
      var load = function () { if (loaded) return; loaded = true; video.src = videoSrc; video.load(); };
      media.classList.add("has-hover");
      media.addEventListener("mouseenter", function () {
        load();
        try { video.currentTime = 0; } catch (e) {}
        video.play().catch(function () {});
      });
      media.addEventListener("mouseleave", function () {
        video.pause();
        try { video.currentTime = 0; } catch (e) {}
      });
    }).catch(function () {});
  });

  /* ---------- SIGNATURE VIDEO — scroll to play (up & down replays) ---------- */
  var sigVideo = document.getElementById("signatureVideo");
  var sigArea = document.getElementById("signatureArea");
  if (sigVideo && sigArea) {
    sigVideo.muted = true;
    sigVideo.volume = 0;
    sigVideo.playsInline = true;
    // ensure no sound, no loop — replay on each enter
    sigVideo.loop = false;
    sigVideo.autoplay = false;
    sigVideo.controls = false;

    // debug: log load errors
    sigVideo.addEventListener("error", function () {
      console.warn("Signature video failed to load:", sigVideo.error);
      sigArea.style.minHeight = "auto";
    });
    sigVideo.addEventListener("loadedmetadata", function () {
      console.log("Signature video loaded:", sigVideo.videoWidth + "x" + sigVideo.videoHeight, sigVideo.duration + "s");
    });

    if (reducedMotion) {
      // show first frame only
      try { sigVideo.currentTime = 0; } catch (e) {}
      sigVideo.pause();
    } else if ("IntersectionObserver" in window) {
      var hasEntered = false;
      var sigObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            hasEntered = true;
            try { sigVideo.currentTime = 0; } catch (e) {}
            var p = sigVideo.play();
            if (p && p.catch) p.catch(function (err) { console.warn("play blocked:", err); });
          } else if (hasEntered) {
            sigVideo.pause();
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px 0px 0px" });
      sigObserver.observe(sigArea);
      // also catch the containing site-content scroll container
      sigObserver.observe(sigVideo);
    } else {
      // fallback: play on click
      sigArea.addEventListener("click", function () {
        try { sigVideo.currentTime = 0; } catch (e) {}
        sigVideo.play().catch(function () {});
      });
      // try autoplay after load
      sigVideo.addEventListener("canplay", function () { sigVideo.play().catch(function () {}); }, { once: true });
    }
  }

})();
