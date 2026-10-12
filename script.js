/* ============================================================
   Ellanchezhiyan M C — Portfolio Scripts
   SARA Neural Brain Assistant, navigation, active spy,
   scroll reveals, copy email utility, and signature video handler.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = "ontouchstart" in window || window.matchMedia("(pointer: coarse)").matches;

  /* ---------- 1. NAVIGATION SCROLL SHADOW & BG ---------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var updateNavScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 15);
    };
    window.addEventListener("scroll", updateNavScroll, { passive: true });
    updateNavScroll();
  }

  /* ---------- 2. ACTIVE NAVIGATION SPY ---------- */
  var navLinks = document.querySelectorAll(".nav-links a:not(.nav-resume), .nav-mobile a:not(.nav-mobile-resume)");
  var sectionIds = ["top", "about", "skills", "projects", "ai-projects", "experience", "certifications", "contact"];
  var sections = sectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            var isTarget = href === "#" + id || (id === "top" && href === "#top");
            link.classList.toggle("active", isTarget);
          });
        }
      });
    }, { threshold: 0.2, rootMargin: "-15% 0px -65% 0px" });

    sections.forEach(function (s) {
      sectionObserver.observe(s);
    });
  }

  /* ---------- 3. MOBILE NAVIGATION DRAWER ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("navMobile");

  if (toggle && mobileNav) {
    var toggleMenu = function (open) {
      var isOpen = typeof open === "boolean" ? open : mobileNav.classList.toggle("open");
      if (typeof open === "boolean") {
        mobileNav.classList.toggle("open", isOpen);
      }
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggleMenu(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (mobileNav.classList.contains("open") && !mobileNav.contains(e.target) && !toggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  }

  /* ---------- 4. SCROLL REVEAL OBSERVER ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reducedMotion && revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- 5. COPY EMAIL BUTTON ---------- */
  var copyEmailBtn = document.getElementById("copyEmailBtn");
  var copyTooltip = document.getElementById("copyTooltip");

  if (copyEmailBtn && copyTooltip) {
    copyEmailBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var emailText = "mcellanchezhiyan@gmail.com";

      var triggerFeedback = function () {
        copyTooltip.classList.add("active");
        setTimeout(function () {
          copyTooltip.classList.remove("active");
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailText).then(triggerFeedback).catch(function () {
          fallbackCopyText(emailText, triggerFeedback);
        });
      } else {
        fallbackCopyText(emailText, triggerFeedback);
      }
    });
  }

  function fallbackCopyText(text, callback) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (err) {
      console.warn("Could not copy text: ", err);
    }
    document.body.removeChild(textArea);
  }

  /* ---------- 6. PROJECT MEDIA HOVER PREVIEWS ---------- */
  var projectMediaEls = document.querySelectorAll(".project-media[data-video]");
  projectMediaEls.forEach(function (media) {
    var video = media.querySelector(".project-media-video");
    var videoSrc = media.dataset.video;
    if (!videoSrc || !video || isTouch) return;

    fetch(videoSrc, { method: "HEAD" }).then(function (res) {
      if (!res.ok) return;
      var loaded = false;
      var load = function () {
        if (loaded) return;
        loaded = true;
        video.src = videoSrc;
        video.load();
      };

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

  /* ---------- 7. SIGNATURE VIDEO PLAYBACK (LOCKED BEHAVIOR) ---------- */
  var sigVideo = document.getElementById("signatureVideo");
  var sigArea = document.getElementById("signatureArea");

  if (sigVideo && sigArea) {
    sigVideo.muted = true;
    sigVideo.volume = 0;
    sigVideo.playsInline = true;
    sigVideo.loop = false;
    sigVideo.autoplay = false;
    sigVideo.controls = false;

    sigVideo.addEventListener("error", function () {
      console.warn("Signature video failed to load:", sigVideo.error);
      sigArea.style.minHeight = "auto";
    });

    if (reducedMotion) {
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
      }, { threshold: 0.15 });

      sigObserver.observe(sigArea);
      sigObserver.observe(sigVideo);
    } else {
      sigArea.addEventListener("click", function () {
        try { sigVideo.currentTime = 0; } catch (e) {}
        sigVideo.play().catch(function () {});
      });
      sigVideo.addEventListener("canplay", function () {
        sigVideo.play().catch(function () {});
      }, { once: true });
    }
  }

  /* ============================================================
     8. SARA — INTERACTIVE ABSTRACT NEURAL BRAIN ASSISTANT
     - Delicate neural network topology (dual cerebral hemispheres)
     - Small synaptic nodes with glowing centers
     - Fine synaptic pulses propagating through neural pathways
     - Floating cognitive ambient particles
     - Smooth gravitational cursor interaction & parallax tilt
     - Click-triggered neural shockwave pulse
     - SARA message reveal: "Hi, I'm Ellan's Assistant."
     ============================================================ */
  function initSaraBrain() {
    var canvas = document.getElementById("saraCanvas");
    var container = document.getElementById("saraViewport");
    var fallback = document.getElementById("saraFallback");
    var messageWrap = document.getElementById("saraMessageWrap");

    if (!canvas || !container) return;

    // Show SARA message with smooth entrance after page load
    setTimeout(function () {
      if (messageWrap) {
        messageWrap.classList.add("visible");
      }
    }, 750);

    if (typeof THREE === "undefined") {
      if (fallback) fallback.style.display = "block";
      return;
    }

    try {
      // Scene, Camera & WebGL Renderer setup
      var scene = new THREE.Scene();
      var width = container.clientWidth || 400;
      var height = container.clientHeight || 440;

      var camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0.1, 4.3);

      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Root Brain Group
      var brainGroup = new THREE.Group();
      scene.add(brainGroup);

      // Lights
      var ambientLight = new THREE.AmbientLight(0x0a1628, 1.8);
      scene.add(ambientLight);

      var keyPointLight = new THREE.PointLight(0x38bdf8, 2.8, 10);
      keyPointLight.position.set(1.5, 2, 3);
      scene.add(keyPointLight);

      var accentPointLight = new THREE.PointLight(0x60a5fa, 2.0, 10);
      accentPointLight.position.set(-2, -1.5, 2);
      scene.add(accentPointLight);

      // ---------- PROCEDURAL NEURAL BRAIN TOPOLOGY ----------
      var nodeCount = 380;
      var nodes = []; // array of { base: Vector3, curr: Vector3, velocity: Vector3, connections: [] }
      var nodePositions = new Float32Array(nodeCount * 3);
      var nodeColors = new Float32Array(nodeCount * 3);

      // Generate anatomically contoured dual-hemisphere brain points
      var colorBase = new THREE.Color(0x38bdf8);
      var colorGlow = new THREE.Color(0x93c5fd);

      var idx = 0;
      while (idx < nodeCount) {
        var u = Math.random() * Math.PI; // 0 to PI
        var v = (Math.random() - 0.5) * Math.PI * 2; // -PI to PI
        var hemi = Math.random() > 0.5 ? 1 : -1; // Left or Right hemisphere

        // Brain envelope parameters
        var r = 1.18 + 0.12 * Math.sin(u * 3.0) * Math.cos(v * 2.0);
        
        // Cortex folds (gyri & sulci)
        var fold = 0.08 * Math.sin(u * 8.0) * Math.cos(v * 7.0);
        r += fold;

        // Coordinates with longitudinal fissure gap
        var x = hemi * (Math.abs(r * Math.sin(u) * Math.cos(v)) * 0.88 + 0.11);
        var y = r * Math.cos(u) * 0.82 + (Math.sin(v) * 0.1);
        var z = r * Math.sin(u) * Math.sin(v) * 1.15;

        // Filter out non-brain volume gaps (temporal & cerebellum adjustments)
        if (y < -0.65 && Math.abs(z) > 0.8) continue;

        var baseVec = new THREE.Vector3(x, y, z);
        nodes.push({
          base: baseVec.clone(),
          curr: baseVec.clone(),
          offset: new THREE.Vector3(),
          hemi: hemi,
          pulse: 0,
          index: idx
        });

        nodePositions[idx * 3] = x;
        nodePositions[idx * 3 + 1] = y;
        nodePositions[idx * 3 + 2] = z;

        var c = THREE.MathUtils.lerp(0.7, 1.0, Math.random());
        nodeColors[idx * 3] = colorBase.r * c;
        nodeColors[idx * 3 + 1] = colorBase.g * c;
        nodeColors[idx * 3 + 2] = colorBase.b * c;

        idx++;
      }

      // Point cloud for Neural Nodes
      var nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
      nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

      // Canvas circle texture for smooth glowing nodes
      function createNodeTexture() {
        var c = document.createElement("canvas");
        c.width = 64;
        c.height = 64;
        var ctx = c.getContext("2d");
        var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(56, 189, 248, 0.85)");
        grad.addColorStop(0.7, "rgba(56, 189, 248, 0.2)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }

      var nodeMaterial = new THREE.PointsMaterial({
        size: 0.08,
        map: createNodeTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      var nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
      brainGroup.add(nodePoints);

      // ---------- SYNAPTIC NEURAL CONNECTIONS (AXONS) ----------
      var maxDist = 0.38;
      var linePairs = [];
      for (var i = 0; i < nodeCount; i++) {
        for (var j = i + 1; j < nodeCount; j++) {
          // Keep connections mostly within the same hemisphere, with interhemispheric corpus callosum links
          var d = nodes[i].base.distanceTo(nodes[j].base);
          if (d < maxDist) {
            if (nodes[i].hemi === nodes[j].hemi || Math.abs(nodes[i].base.x) < 0.25) {
              linePairs.push(i, j);
            }
          }
        }
      }

      var lineCount = linePairs.length;
      var linePositions = new Float32Array(lineCount * 3);
      var lineColors = new Float32Array(lineCount * 3);

      for (var k = 0; k < lineCount; k++) {
        var nodeIdx = linePairs[k];
        linePositions[k * 3] = nodes[nodeIdx].base.x;
        linePositions[k * 3 + 1] = nodes[nodeIdx].base.y;
        linePositions[k * 3 + 2] = nodes[nodeIdx].base.z;

        lineColors[k * 3] = 0.12;
        lineColors[k * 3 + 1] = 0.45;
        lineColors[k * 3 + 2] = 0.75;
      }

      var lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

      var lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      var neuralLines = new THREE.LineSegments(lineGeometry, lineMaterial);
      brainGroup.add(neuralLines);

      // ---------- SYNAPTIC LIGHT PULSES (ACTION POTENTIALS) ----------
      var pulseCount = 18;
      var pulses = [];
      for (var p = 0; p < pulseCount; p++) {
        var randLineIdx = Math.floor(Math.random() * (lineCount / 2)) * 2;
        pulses.push({
          startIdx: linePairs[randLineIdx],
          endIdx: linePairs[randLineIdx + 1],
          progress: Math.random(),
          speed: 0.4 + Math.random() * 0.6
        });
      }

      var pulseGeometry = new THREE.BufferGeometry();
      var pulsePositions = new Float32Array(pulseCount * 3);
      pulseGeometry.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));

      var pulseMaterial = new THREE.PointsMaterial({
        size: 0.12,
        map: createNodeTexture(),
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      var pulsePoints = new THREE.Points(pulseGeometry, pulseMaterial);
      brainGroup.add(pulsePoints);

      // ---------- AMBIENT COGNITIVE DUST PARTICLES ----------
      var dustCount = 70;
      var dustGeometry = new THREE.BufferGeometry();
      var dustPositions = new Float32Array(dustCount * 3);
      for (var dIdx = 0; dIdx < dustCount; dIdx++) {
        var rad = 1.4 + Math.random() * 0.8;
        var th = Math.random() * Math.PI * 2;
        var ph = (Math.random() - 0.5) * Math.PI;
        dustPositions[dIdx * 3] = rad * Math.cos(th) * Math.cos(ph);
        dustPositions[dIdx * 3 + 1] = rad * Math.sin(ph);
        dustPositions[dIdx * 3 + 2] = rad * Math.sin(th) * Math.cos(ph);
      }
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      var dustMaterial = new THREE.PointsMaterial({
        size: 0.035,
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      var dustPoints = new THREE.Points(dustGeometry, dustMaterial);
      brainGroup.add(dustPoints);

      // Inner Core Glow
      var coreGeo = new THREE.SphereGeometry(0.65, 18, 18);
      var coreMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
      });
      var innerCore = new THREE.Mesh(coreGeo, coreMat);
      brainGroup.add(innerCore);

      // ---------- MOUSE & POINTER PHYSICS ----------
      var mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      var isHovered = false;
      var clickWave = { active: false, time: 0, origin: new THREE.Vector3() };

      function onPointerMove(e) {
        var rect = container.getBoundingClientRect();
        var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        var x = ((clientX - rect.left) / rect.width) * 2 - 1;
        var y = -(((clientY - rect.top) / rect.height) * 2 - 1);

        mouse.targetX = Math.max(-1.2, Math.min(1.2, x));
        mouse.targetY = Math.max(-1.2, Math.min(1.2, y));
        isHovered = true;
      }

      container.addEventListener("mousemove", onPointerMove, { passive: true });
      container.addEventListener("touchmove", onPointerMove, { passive: true });

      container.addEventListener("mouseleave", function () {
        isHovered = false;
        mouse.targetX = 0;
        mouse.targetY = 0;
      });

      // Click / Tap triggers a restrained neural wave propagating across synapses
      container.addEventListener("click", function (e) {
        clickWave.active = true;
        clickWave.time = 0;
        clickWave.origin.set(mouse.x * 1.2, mouse.y * 1.0, 0.4);
      });

      // Window resize
      function onResize() {
        if (!container) return;
        var newW = container.clientWidth;
        var newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
      window.addEventListener("resize", onResize, { passive: true });

      // ---------- ANIMATION LOOP ----------
      var clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);

        var elapsedTime = clock.getElapsedTime();
        var delta = clock.getDelta();

        // Cursor lerp for smooth parallax damping
        mouse.x += (mouse.targetX - mouse.x) * 0.045;
        mouse.y += (mouse.targetY - mouse.y) * 0.045;

        // Subtle autonomous breathing when idle
        var idleTiltY = Math.sin(elapsedTime * 0.45) * 0.18;
        var idleTiltX = Math.cos(elapsedTime * 0.6) * 0.08;

        var targetRotY = (isHovered ? mouse.x * 0.55 : idleTiltY) + elapsedTime * 0.08;
        var targetRotX = (isHovered ? -mouse.y * 0.45 : idleTiltX) + 0.05;

        brainGroup.rotation.y = targetRotY;
        brainGroup.rotation.x = targetRotX;
        brainGroup.rotation.z = Math.sin(elapsedTime * 0.4) * 0.03;

        // Light tracking
        keyPointLight.position.x = 1.8 + mouse.x * 1.5;
        keyPointLight.position.y = 2.0 + mouse.y * 1.2;

        // Update Click Wave
        if (clickWave.active) {
          clickWave.time += delta * 2.6;
          if (clickWave.time > 3.0) {
            clickWave.active = false;
          }
        }

        // Update Node Positions & Synaptic Lines
        var nodePosArray = nodeGeometry.attributes.position.array;
        var nodeColArray = nodeGeometry.attributes.color.array;
        var linePosArray = lineGeometry.attributes.position.array;
        var lineColArray = lineGeometry.attributes.color.array;

        var waveRadius = clickWave.active ? clickWave.time * 1.2 : -1;

        if (!reducedMotion) {
          for (var n = 0; n < nodeCount; n++) {
            var node = nodes[n];
            var bx = node.base.x;
            var by = node.base.y;
            var bz = node.base.z;

            // Micro-breathing oscillation
            var breath = 1.0 + Math.sin(elapsedTime * 1.8 + bx * 3.0 + by * 2.0) * 0.02;

            // Calculate wave pulse distance
            var pulseBright = 0;
            if (clickWave.active) {
              var distToOrigin = node.base.distanceTo(clickWave.origin);
              var waveDist = Math.abs(distToOrigin - waveRadius);
              if (waveDist < 0.35) {
                pulseBright = (1.0 - waveDist / 0.35) * Math.max(0, 1.0 - clickWave.time / 2.5);
                breath += pulseBright * 0.06;
              }
            }

            var cx = bx * breath;
            var cy = by * breath;
            var cz = bz * breath;

            node.curr.set(cx, cy, cz);

            var pIdx = n * 3;
            nodePosArray[pIdx] = cx;
            nodePosArray[pIdx + 1] = cy;
            nodePosArray[pIdx + 2] = cz;

            // Brighten node when near click wave or cursor
            var baseC = 0.75 + pulseBright * 0.6;
            nodeColArray[pIdx] = Math.min(1.0, colorBase.r * baseC + pulseBright * 0.5);
            nodeColArray[pIdx + 1] = Math.min(1.0, colorBase.g * baseC + pulseBright * 0.5);
            nodeColArray[pIdx + 2] = Math.min(1.0, colorBase.b * baseC + pulseBright * 0.5);
          }

          nodeGeometry.attributes.position.needsUpdate = true;
          nodeGeometry.attributes.color.needsUpdate = true;

          // Update Line Positions based on deformed nodes
          for (var l = 0; l < lineCount; l++) {
            var nIdx = linePairs[l];
            var currNode = nodes[nIdx];
            var lIdx = l * 3;
            linePosArray[lIdx] = currNode.curr.x;
            linePosArray[lIdx + 1] = currNode.curr.y;
            linePosArray[lIdx + 2] = currNode.curr.z;
          }
          lineGeometry.attributes.position.needsUpdate = true;

          // Update Pulses (action potentials moving along axons)
          var pulsePosArray = pulseGeometry.attributes.position.array;
          for (var q = 0; q < pulseCount; q++) {
            var pulse = pulses[q];
            pulse.progress += delta * pulse.speed;
            if (pulse.progress >= 1.0) {
              pulse.progress = 0;
              var newRandLine = Math.floor(Math.random() * (lineCount / 2)) * 2;
              pulse.startIdx = linePairs[newRandLine];
              pulse.endIdx = linePairs[newRandLine + 1];
            }

            var nStart = nodes[pulse.startIdx].curr;
            var nEnd = nodes[pulse.endIdx].curr;

            pulsePosArray[q * 3] = THREE.MathUtils.lerp(nStart.x, nEnd.x, pulse.progress);
            pulsePosArray[q * 3 + 1] = THREE.MathUtils.lerp(nStart.y, nEnd.y, pulse.progress);
            pulsePosArray[q * 3 + 2] = THREE.MathUtils.lerp(nStart.z, nEnd.z, pulse.progress);
          }
          pulseGeometry.attributes.position.needsUpdate = true;
        }

        // Ambient cognitive dust orbit
        dustPoints.rotation.y = elapsedTime * 0.04;
        dustPoints.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;

        renderer.render(scene, camera);
      }

      animate();

    } catch (err) {
      console.warn("SARA Brain WebGL initialization failed, fallback active:", err);
      if (fallback) fallback.style.display = "block";
    }
  }

  // Initialize SARA brain when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSaraBrain);
  } else {
    initSaraBrain();
  }

  /* ==========================================================================
     SARA WELCOME INTRODUCTION SEQUENCE & STORYTELLER ARCHITECTURE
     ========================================================================== */
  function initSaraIntroSequence() {
    var overlay = document.getElementById("saraIntroOverlay");
    var skipBtn = document.getElementById("saraSkipBtn");
    var stage = overlay ? overlay.querySelector(".sara-intro-stage") : null;
    var bot = document.getElementById("saraBot");
    var head = bot ? bot.querySelector(".sara-head") : null;
    var eyesWrap = document.getElementById("saraEyesWrap");
    var eyeLeft = document.getElementById("saraEyeLeft");
    var eyeRight = document.getElementById("saraEyeRight");
    var bubble = document.getElementById("saraSpeechBubble");
    var heading = document.getElementById("saraSpeechHeading");
    var message = document.getElementById("saraSpeechMessage");

    if (!overlay || !stage || !bot) return;

    var STORAGE_KEY = "sara_intro_seen";
    var isDismissed = false;
    var timeouts = [];
    var blinkTimer = null;
    var isTrackingMouse = false;

    function safeTimeout(fn, ms) {
      var id = setTimeout(function() {
        if (!isDismissed) fn();
      }, ms);
      timeouts.push(id);
      return id;
    }

    function clearAllTimers() {
      timeouts.forEach(function(t) { clearTimeout(t); });
      timeouts = [];
      if (blinkTimer) clearInterval(blinkTimer);
      window.removeEventListener("mousemove", handleMouseMove);
    }

    function dismissIntro(instant) {
      if (isDismissed) return;
      isDismissed = true;
      clearAllTimers();

      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch (e) {
        // Storage access blocked fallback
      }

      if (instant) {
        overlay.classList.add("dismissed");
        return;
      }

      overlay.classList.add("dismissing");
      setTimeout(function() {
        overlay.classList.add("dismissed");
      }, 700);
    }

    // Natural Eye Blink
    function triggerBlink() {
      if (isDismissed || !eyeLeft || !eyeRight) return;
      eyeLeft.classList.add("blink");
      eyeRight.classList.add("blink");
      setTimeout(function() {
        if (eyeLeft && eyeRight) {
          eyeLeft.classList.remove("blink");
          eyeRight.classList.remove("blink");
        }
      }, 140);
    }

    // Subtle Eye Cursor Tracking
    function handleMouseMove(e) {
      if (isDismissed || !isTrackingMouse || !eyesWrap || !bot) return;
      var rect = bot.getBoundingClientRect();
      var botCenterX = rect.left + rect.width / 2;
      var botCenterY = rect.top + rect.height * 0.35;

      var dx = (e.clientX - botCenterX) / (window.innerWidth / 2);
      var dy = (e.clientY - botCenterY) / (window.innerHeight / 2);

      var moveX = Math.max(-6, Math.min(6, dx * 6));
      var moveY = Math.max(-4, Math.min(4, dy * 4));

      eyesWrap.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
    }

    // Global SARA API for future contextual storytelling across sections
    window.SARA = {
      say: function(headingText, messageText, durationMs, onDone) {
        if (!bubble || !heading || !message) return;
        heading.textContent = headingText;
        message.textContent = messageText;
        bubble.classList.add("active");
        if (durationMs) {
          setTimeout(function() {
            bubble.classList.remove("active");
            if (typeof onDone === "function") onDone();
          }, durationMs);
        }
      },
      hideSpeech: function() {
        if (bubble) bubble.classList.remove("active");
      },
      lookAt: function(x, y) {
        if (!eyesWrap) return;
        var moveX = Math.max(-6, Math.min(6, x));
        var moveY = Math.max(-4, Math.min(4, y));
        eyesWrap.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
      },
      blink: triggerBlink,
      setMood: function(mood) {
        if (!head) return;
        head.classList.remove("tilt-greet", "tilt-listen");
        if (mood === "greet") head.classList.add("tilt-greet");
        if (mood === "listen") head.classList.add("tilt-listen");
      },
      skipIntro: function() {
        dismissIntro(false);
      },
      isIntroComplete: function() {
        return isDismissed;
      }
    };

    // Check if user has already experienced intro in current session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        dismissIntro(true);
        return;
      }
    } catch (e) {}

    // Check prefers-reduced-motion
    var prefersReducedMotion = false;
    try {
      prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}

    // Skip Button & Click / Keyboard Shortcuts
    if (skipBtn) {
      skipBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        dismissIntro(false);
      });
    }

    overlay.addEventListener("click", function(e) {
      if (e.target === overlay || e.target.classList.contains("sara-intro-backdrop")) {
        dismissIntro(false);
      }
    });

    window.addEventListener("keydown", function(e) {
      if (!isDismissed && (e.key === "Escape" || e.key === " ")) {
        dismissIntro(false);
      }
    });

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    blinkTimer = setInterval(triggerBlink, 3400);

    // Reduced Motion Path
    if (prefersReducedMotion) {
      if (bubble) bubble.classList.add("active");
      if (heading) heading.textContent = "Hi!";
      if (message) message.textContent = "Welcome to Ellan's portfolio.";
      safeTimeout(function() {
        dismissIntro(false);
      }, 1400);
      return;
    }

    // =========================================================================
    // CINEMATIC TIMELINE CHOREOGRAPHY (Total Duration: ~4.2 - 4.5s)
    // =========================================================================

    // 0.0s - 0.2s: Begin entrance from outside the left edge
    stage.classList.add("entering");
    bot.classList.add("walking");
    if (eyesWrap) {
      eyesWrap.style.transform = "translate(3px, 0px)"; // Eyes look forward in motion direction
    }

    // 1.2s - 1.7s: SARA arrives at center, settles in, greets visitor
    safeTimeout(function() {
      bot.classList.remove("walking"); // Switch from walking bob to gentle hover
      if (head) head.classList.add("tilt-greet");
      if (eyesWrap) eyesWrap.style.transform = "translate(0px, 0px)";
      triggerBlink();
      isTrackingMouse = true;
    }, 1200);

    // 1.7s - 2.4s: Dialogue 1 ("Hi! I'm SARA, Ellan's assistant.")
    safeTimeout(function() {
      if (bubble) bubble.classList.add("active");
      if (heading) heading.textContent = "Hi!";
      if (message) message.textContent = "I'm SARA, Ellan's assistant.";
    }, 1700);

    // 2.4s - 3.1s: Dialogue 2 ("Welcome to Ellan's portfolio.")
    safeTimeout(function() {
      if (heading && message) {
        heading.classList.add("speech-fading");
        message.classList.add("speech-fading");

        setTimeout(function() {
          if (heading) heading.textContent = "Welcome!";
          if (message) message.textContent = "Welcome to Ellan's portfolio.";
          if (heading) heading.classList.remove("speech-fading");
          if (message) message.classList.remove("speech-fading");
          if (head) {
            head.classList.remove("tilt-greet");
            head.classList.add("tilt-listen");
          }
        }, 200);
      }
    }, 2400);

    // 3.1s - 3.8s: SARA prepares to leave (closes speech bubble, glances toward portfolio)
    safeTimeout(function() {
      if (bubble) bubble.classList.remove("active");
      isTrackingMouse = false;
      if (eyesWrap) eyesWrap.style.transform = "translate(5px, 2px)"; // Glance toward portfolio
      if (head) head.classList.remove("tilt-greet", "tilt-listen");
    }, 3150);

    // 3.8s - 4.5s: SARA moves gracefully toward side while homepage smoothly reveals
    safeTimeout(function() {
      dismissIntro(false);
    }, 3800);
  }

  // Initialize SARA intro sequence
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSaraIntroSequence);
  } else {
    initSaraIntroSequence();
  }

})();


/* =============================================================================
   SARA STORYTELLER — PHASE 2 (journey-aware)
   Reusable section-aware contextual storyteller widget
   Exposes: window.SARAStoryteller
   Architecture: IntersectionObserver + section-entry visit state + cooldown
   - Speaks once per visit; eligible again after leave + meaningful re-entry
   - No session-wide "already shown" flags; a short cooldown prevents spam
   ============================================================================= */
(function() {
  "use strict";

  /* -------------------------------------------------------------------------
     CONTENT POOLS
     First-visit messages preserve the original copy. Revisit pools rotate so
     SARA accompanies the journey instead of repeating herself. All statements
     stay factual and reuse wording already present in the portfolio.
     first     → message on the first visit
     revisits  → rotated on later visits
     autoHide  → ms before the bubble minimizes itself (0 = stays open)
  --------------------------------------------------------------------------- */
  var DWELL_SECTION_MS = 800;   // settled time before a section entry counts
  var DWELL_PROJECT_MS = 700;   // settled time before a project entry counts
  var COOLDOWN_MS = 6000;       // minimum gap between contextual messages

  var SECTION_POOLS = {
    "top": {
      first: "Hi again! I'll show you around Ellan's work.",
      revisits: [
        "Back at the top? The full tour starts with a scroll.",
        "Ellan's portfolio — take your time looking around."
      ],
      autoHide: 5000
    },
    "about": {
      first: "Let me introduce you to Ellan.\n\nHe's an Artificial Intelligence & Data Science student who enjoys turning ideas into working systems.",
      revisits: [
        "That's Ellan — an AI & Data Science student turning ideas into working systems.",
        "Ellan's story in short: messy data in, working software out."
      ],
      autoHide: 7000
    },
    "skills": {
      first: "Here’s the toolbox behind Ellan’s projects.",
      revisits: [
        "Want to see what powers those projects?",
        "Here’s a closer look at the tools behind the work."
      ],
      autoHide: 5000
    },
    "projects": {
      first: "Let's explore what Ellan has built.",
      revisits: [
        "Back to the projects? Let’s see what catches your eye.",
        "Here’s where Ellan’s ideas become working systems."
      ],
      autoHide: 5000
    },
    "experience": {
      first: "Hands-on work so far — an AI internship and a data analyst simulation.",
      revisits: [
        "Codec Technologies: NLP, RAG and a customer-service chatbot.",
        "Deloitte simulation: business datasets and a Tableau dashboard."
      ],
      autoHide: 6000
    },
    "certifications": {
      first: "Credentials along the way — Deloitte, Infosys Springboard, TCS iON and more.",
      revisits: [
        "Python and NumPy foundations via Infosys Springboard.",
        "Always learning — AI, data and computer science certifications."
      ],
      autoHide: 6000
    },
    "contact": {
      first: "You made it to the end!\nWant to get in touch with Ellan?",
      revisits: [
        "Ellan's open to internships and placements — say hello.",
        "Email, phone, LinkedIn, GitHub — pick whichever suits you."
      ],
      autoHide: 7000
    }
  };

  /* Project pools (data-project values and work-item ids).
     First-visit copy preserves the original greeting + description. */
  var PROJECT_POOLS = {
    "alpha": {
      greeting: "Oh, you found Alpha!",
      description: "A personal AI assistant built to work offline via Ollama, with multi-stage message processing for relevance and personalization.",
      revisits: [
        "Alpha again — your offline assistant via Ollama.",
        "Back to Alpha — multi-stage processing for relevance and personalization."
      ],
      autoHide: 7000
    },
    "codetrack": {
      greeting: "This is CodeTrack!",
      description: "A dashboard that tracks student coding activity across LeetCode and GitHub automatically.",
      revisits: [
        "CodeTrack again — LeetCode and GitHub activity, tracked automatically.",
        "Still CodeTrack — usernames in, performance trends out."
      ],
      autoHide: 7000
    },
    "nitra": {
      greeting: "This is NITRA!",
      description: "A Network Incident Triage & Response Assistant that groups telemetry alerts into triage clusters.",
      revisits: [
        "NITRA again — telemetry alerts grouped into triage clusters.",
        "Back at NITRA — likely causes, affected services and timelines."
      ],
      autoHide: 7000
    },
    "knovaul": {
      greeting: "Here's KnoVault!",
      description: "Upload PDFs, slides and docs — get direct answers pulled from that material using RAG and an LLM.",
      revisits: [
        "KnoVault again — answers pulled straight from your uploads.",
        "Back at KnoVault — chunking, vector retrieval and clear formatted answers."
      ],
      autoHide: 7000
    },
    "knovault": {
      greeting: "Here's KnoVault!",
      description: "Upload PDFs, slides and docs — get direct answers pulled from that material using RAG and an LLM.",
      revisits: [
        "KnoVault again — answers pulled straight from your uploads.",
        "Back at KnoVault — chunking, vector retrieval and clear formatted answers."
      ],
      autoHide: 7000
    }
  };

  /* -------------------------------------------------------------------------
     JOURNEY STATE — section-entry model (no session-wide seen flags)
     currentSection / previousSection : dominant section right now / before
     visitId / spokeVisitId           : visit counter + visit already served
     sectionVisits                    : id -> visit count (first vs revisit copy)
     currentProject / projectVisitId  : dominant project + its visit counter
     lastSpokeAt                      : cooldown timestamp between messages
     scrollDir                        : last scroll direction ('up' | 'down')
  --------------------------------------------------------------------------- */
  var widget = null;
  var bubbleEl = null;
  var bubbleTextEl = null;
  var closeBtn = null;
  var avatarBtn = null;
  var eyeL = null;
  var eyeR = null;

  var isUserDismissed = false;  // user explicitly closed bubble; re-open via avatar
  var currentAutoHideTimer = null;
  var blinkInterval = null;
  var messageQueue = [];        // max 1 explicit message waiting for a free bubble

  var journey = {
    currentSection: null,
    previousSection: null,
    visitId: 0,
    spokeVisitId: -1,
    sectionVisits: {},
    currentProject: null,
    projectVisitId: 0,
    spokeProjectVisitId: -1,
    projectVisits: {},
    lastSpokeAt: -COOLDOWN_MS, // no cooldown before the first message
    scrollDir: "none",
    scrollDirAtEntry: "none",
    lastScrollY: 0
  };

  function isBubbleOpen() {
    return !!(bubbleEl && bubbleEl.classList.contains("active"));
  }

  function flagUserDismissed() {
    isUserDismissed = true;
    if (avatarBtn) avatarBtn.classList.add("has-message");
  }

  /* -------------------------------------------------------------------------
     BLINK
  --------------------------------------------------------------------------- */
  function triggerStBlink() {
    if (!eyeL || !eyeR) return;
    eyeL.classList.add("blink");
    eyeR.classList.add("blink");
    setTimeout(function() {
      if (eyeL) eyeL.classList.remove("blink");
      if (eyeR) eyeR.classList.remove("blink");
    }, 120);
  }

  /* -------------------------------------------------------------------------
     SHOW / HIDE BUBBLE
  --------------------------------------------------------------------------- */
  function showBubble(text, autoHideMs) {
    if (!bubbleEl || !bubbleTextEl) return;
    if (currentAutoHideTimer) clearTimeout(currentAutoHideTimer);

    bubbleTextEl.textContent = text;
    bubbleEl.classList.add("active");
    if (avatarBtn) {
      avatarBtn.classList.remove("has-message");
      avatarBtn.setAttribute("aria-label", "Close SARA message");
    }
    triggerStBlink();

    if (autoHideMs && autoHideMs > 0) {
      currentAutoHideTimer = setTimeout(hideBubble, autoHideMs);
    }
  }

  function hideBubble() {
    if (!bubbleEl) return;
    if (currentAutoHideTimer) { clearTimeout(currentAutoHideTimer); currentAutoHideTimer = null; }
    bubbleEl.classList.remove("active");
    if (avatarBtn) {
      avatarBtn.setAttribute("aria-label", "Open SARA assistant");
    }
    pumpQueue();
  }

  /* Deliver one queued explicit message once the bubble is free and the
     cooldown has elapsed. Contextual triggers never queue — they drop. */
  function pumpQueue() {
    if (!messageQueue.length || isBubbleOpen() || isUserDismissed) return;
    var wait = COOLDOWN_MS - (Date.now() - journey.lastSpokeAt);
    if (wait > 0) {
      setTimeout(pumpQueue, wait + 60);
      return;
    }
    var next = messageQueue.shift();
    showWidget();
    showBubble(next.message, next.autoHide);
    journey.lastSpokeAt = Date.now();
  }

  /* -------------------------------------------------------------------------
     SHOW WIDGET
  --------------------------------------------------------------------------- */
  function showWidget() {
    if (!widget) return;
    widget.removeAttribute("hidden");
    widget.classList.add("st-visible");
    // Start idle blink
    if (!blinkInterval) {
      blinkInterval = setInterval(triggerStBlink, 3600 + Math.random() * 2000);
    }
  }

  /* -------------------------------------------------------------------------
     SPEAK PIPELINE: requestSpeak → cooldown/busy gates → bubble
     - While a message is showing, contextual triggers are dropped (never
       replaced mid-speech); explicit say() calls wait as a single queued item.
     - Inside the cooldown window, contextual triggers get a bounded retry
       that only fires if the same visit is still current — otherwise dropped.
     ticket: { alive(), retries, explicit, onShown }
  --------------------------------------------------------------------------- */
  function requestSpeak(message, autoHide, ticket) {
    ticket = ticket || {};
    if (!message) return false;
    if (isUserDismissed) {
      if (avatarBtn) avatarBtn.classList.add("has-message");
      return false;
    }
    if (isBubbleOpen()) {
      if (ticket.explicit) {
        messageQueue.length = 0;
        messageQueue.push({ message: message, autoHide: autoHide });
      }
      return false;
    }
    var wait = COOLDOWN_MS - (Date.now() - journey.lastSpokeAt);
    if (wait > 0) {
      if (ticket.explicit) {
        messageQueue.length = 0;
        messageQueue.push({ message: message, autoHide: autoHide });
        setTimeout(pumpQueue, wait + 60);
        return false;
      }
      if (ticket.retries > 0 && ticket.alive && ticket.alive()) {
        ticket.retries -= 1;
        setTimeout(function() {
          if (ticket.alive && ticket.alive()) requestSpeak(message, autoHide, ticket);
        }, wait + 60);
      }
      return false;
    }
    showWidget();
    showBubble(message, autoHide != null ? autoHide : 5500);
    journey.lastSpokeAt = Date.now();
    if (ticket.onShown) ticket.onShown();
    return true;
  }

  /* -------------------------------------------------------------------------
     PUBLIC API: SARAStoryteller.say(config)
     config = { message, autoHide, delay, force }
     Explicit calls jump the visit logic but still respect busy/cooldown
     (they queue once instead of interrupting). force bypasses the cooldown.
  --------------------------------------------------------------------------- */
  function say(config) {
    if (!config || !config.message) return;
    if (config.force) {
      journey.lastSpokeAt = 0;
      messageQueue.length = 0;
    }
    var delay = config.delay || 0;
    setTimeout(function() {
      requestSpeak(config.message, config.autoHide != null ? config.autoHide : 5500, { explicit: true, retries: 0 });
    }, delay);
  }

  function pickSectionMessage(id, visitCount) {
    var pool = SECTION_POOLS[id];
    if (!pool) return null;
    if (visitCount <= 1 || !pool.revisits || !pool.revisits.length) return pool.first;
    return pool.revisits[(visitCount - 2) % pool.revisits.length];
  }

  function pickProjectMessage(key, visitCount) {
    var pool = PROJECT_POOLS[key];
    if (!pool) return null;
    if (visitCount > 1 && pool.revisits && pool.revisits.length) {
      return pool.revisits[(visitCount - 2) % pool.revisits.length];
    }
    if (pool.first) return pool.first;
    return pool.greeting + "\n\n" + pool.description;
  }

  /* -------------------------------------------------------------------------
     SECTION-ENTRY TRACKING
     The dominant section (highest visible ratio above threshold) is the
     active one. A change of active section starts a new visit; SARA speaks
     only after the visitor settles (dwell) — scrolling straight through a
     section stays quiet. Hysteresis guards against boundary jitter.
  --------------------------------------------------------------------------- */
  var sectionRatios = {};

  function recomputeActiveSection() {
    var best = null;
    var bestRatio = 0;
    Object.keys(sectionRatios).forEach(function(id) {
      if (sectionRatios[id] > bestRatio) {
        bestRatio = sectionRatios[id];
        best = id;
      }
    });
    if (!best || bestRatio < 0.2) return; // no clear active section
    if (best === journey.currentSection) return;
    if (journey.currentSection) {
      var curRatio = sectionRatios[journey.currentSection] || 0;
      if (curRatio >= 0.2 && (bestRatio - curRatio) < 0.12) return; // jitter guard
    }
    enterSection(best);
  }

  function enterSection(id) {
    journey.previousSection = journey.currentSection;
    journey.currentSection = id;
    journey.visitId += 1;
    journey.spokeVisitId = -1; // new visit → eligible again
    journey.sectionVisits[id] = (journey.sectionVisits[id] || 0) + 1;
    journey.scrollDirAtEntry = journey.scrollDir;
    var myVisit = journey.visitId;
    var visitCount = journey.sectionVisits[id];
    var message = pickSectionMessage(id, visitCount);
    if (!message) return;
    var pool = SECTION_POOLS[id];
    setTimeout(function() {
      if (journey.visitId !== myVisit) return;      // visitor moved on
      if (journey.currentSection !== id) return;     // left meanwhile
      if (journey.spokeVisitId === myVisit) return;  // already spoke
      requestSpeak(message, pool ? pool.autoHide : 5500, {
        retries: 2,
        alive: function() {
          return journey.visitId === myVisit && journey.currentSection === id;
        },
        onShown: function() { journey.spokeVisitId = myVisit; }
      });
    }, DWELL_SECTION_MS);
  }

  function initSectionObserver() {
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var id = entry.target.id;
        if (!SECTION_POOLS[id]) return;
        sectionRatios[id] = entry.isIntersecting ? (entry.intersectionRatio || 0) : 0;
      });
      recomputeActiveSection();
    }, {
      threshold: [0, 0.2, 0.4, 0.6, 0.8],
      rootMargin: "0px 0px -10% 0px"
    });

    Object.keys(SECTION_POOLS).forEach(function(id) {
      var el = document.getElementById(id);
      // Skip zero-height anchors (e.g. legacy #ai-projects marker): they can
      // never be "meaningfully entered".
      if (el && el.offsetHeight > 40) observer.observe(el);
    });
  }

  /* -------------------------------------------------------------------------
     PROJECT-ENTRY TRACKING (viewport-based, same on mobile — no hover)
     A project counts as entered when it becomes dominant (ratio >= 0.55)
     and stays settled through the dwell. Scrolling within the same project
     stays quiet; leaving (another project dominates, or none does) ends the
     visit so a later return may speak again.
  --------------------------------------------------------------------------- */
  var projectRatios = {};
  var projectEls = {};

  function recomputeActiveProject() {
    var best = null;
    var bestRatio = 0;
    Object.keys(projectRatios).forEach(function(key) {
      if (projectRatios[key] > bestRatio) {
        bestRatio = projectRatios[key];
        best = key;
      }
    });
    var next = (best && bestRatio >= 0.55) ? best : null;
    if (next === journey.currentProject) return;
    if (next && journey.currentProject) {
      var curRatio = projectRatios[journey.currentProject] || 0;
      if (curRatio >= 0.55 && (bestRatio - curRatio) < 0.12) return; // jitter guard
    }
    enterProject(next);
  }

  function projectKeyFor(el) {
    return el.id || el.getAttribute("data-project");
  }

  function enterProject(key) {
    journey.currentProject = key;
    if (!key) return; // scrolled away from every project — visit ends here
    journey.projectVisitId += 1;
    journey.spokeProjectVisitId = -1; // new visit → eligible again
    journey.projectVisits[key] = (journey.projectVisits[key] || 0) + 1;
    var myVisit = journey.projectVisitId;
    var visitCount = journey.projectVisits[key];
    var lookup = key;
    if (!PROJECT_POOLS[lookup]) {
      var el = projectEls[key];
      lookup = el ? el.getAttribute("data-project") : null;
    }
    var message = lookup ? pickProjectMessage(lookup, visitCount) : null;
    if (!message) return;
    var pool = PROJECT_POOLS[lookup];
    setTimeout(function() {
      if (journey.projectVisitId !== myVisit) return;   // moved on
      if (journey.currentProject !== key) return;        // left meanwhile
      if (journey.spokeProjectVisitId === myVisit) return;
      requestSpeak(message, pool ? pool.autoHide : 7000, {
        retries: 2,
        alive: function() {
          return journey.projectVisitId === myVisit && journey.currentProject === key;
        },
        onShown: function() {
          journey.spokeProjectVisitId = myVisit;
          // A project message consumes this section visit's turn so SARA
          // doesn't double-speak when deep-linking straight into a project.
          journey.spokeVisitId = journey.visitId;
        }
      });
    }, DWELL_PROJECT_MS);
  }

  function initProjectObserver() {
    if (!("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".work-item[id]");
    if (!items.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var key = projectKeyFor(entry.target);
        projectEls[key] = entry.target;
        projectRatios[key] = entry.isIntersecting ? (entry.intersectionRatio || 0) : 0;
      });
      recomputeActiveProject();
    }, {
      threshold: [0, 0.35, 0.55, 0.75],
      rootMargin: "0px 0px -5% 0px"
    });

    items.forEach(function(item) {
      var key = projectKeyFor(item);
      projectEls[key] = item;
      projectRatios[key] = 0;
      observer.observe(item);
    });
  }

  /* -------------------------------------------------------------------------
     SCROLL DIRECTION — recorded on every entry; reversals naturally create
     new visits through the observers above.
  --------------------------------------------------------------------------- */
  function initScrollDirection() {
    try { journey.lastScrollY = window.scrollY || 0; } catch (e) { journey.lastScrollY = 0; }
    window.addEventListener("scroll", function() {
      var y = 0;
      try { y = window.scrollY || 0; } catch (e) {}
      if (y > journey.lastScrollY + 2) journey.scrollDir = "down";
      else if (y < journey.lastScrollY - 2) journey.scrollDir = "up";
      journey.lastScrollY = y;
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------
     AVATAR & CLOSE BUTTON INTERACTIONS
  --------------------------------------------------------------------------- */
  function initControls() {
    // Close button
    if (closeBtn) {
      closeBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        hideBubble();
        flagUserDismissed();
      });
    }

    // Avatar click — toggle bubble or re-open last message
    if (avatarBtn) {
      avatarBtn.addEventListener("click", function() {
        if (bubbleEl && bubbleEl.classList.contains("active")) {
          hideBubble();
          flagUserDismissed();
        } else {
          isUserDismissed = false;
          avatarBtn.classList.remove("has-message");
          // Show a friendly re-open message
          showBubble("Need help navigating? Just scroll around — I'll guide you!", 6000);
        }
      });

      // Keyboard: Enter/Space
      avatarBtn.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          avatarBtn.click();
        }
      });
    }
  }

  /* -------------------------------------------------------------------------
     INIT — called after intro finishes (or immediately if no intro)
  --------------------------------------------------------------------------- */
  function init() {
    widget      = document.getElementById("saraStoryteller");
    bubbleEl    = document.getElementById("saraStBubble");
    bubbleTextEl = document.getElementById("saraStBubbleText");
    closeBtn    = document.getElementById("saraStClose");
    avatarBtn   = document.getElementById("saraStAvatar");
    eyeL        = document.getElementById("saraStEyeL");
    eyeR        = document.getElementById("saraStEyeR");

    if (!widget) return;

    // Respect prefers-reduced-motion: skip blink intervals
    var prefersReduced = false;
    try { prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(e) {}

    initControls();
    initScrollDirection();
    initSectionObserver();
    initProjectObserver();

    // Show widget right away (hidden until first message or intro done)
    showWidget();

    // Expose extended public API for future use
    window.SARAStoryteller = {
      say: say,
      hide: hideBubble,
      show: showWidget,
      addSection: function(id, config) {
        if (!config) return;
        SECTION_POOLS[id] = {
          first: config.first || config.message,
          revisits: config.revisits || [],
          autoHide: config.autoHide != null ? config.autoHide : 5500
        };
        var el = document.getElementById(id);
        if (el && el.offsetHeight > 40 && sectionRatios[id] === undefined) {
          sectionRatios[id] = 0;
        }
      },
      addProject: function(id, config) {
        if (!config) return;
        PROJECT_POOLS[id] = {
          greeting: config.greeting,
          description: config.description,
          first: config.first,
          revisits: config.revisits || [],
          autoHide: config.autoHide != null ? config.autoHide : 7000
        };
      },
      reset: function() {
        // Fresh tour: forget visit counts and cooldown, keep pools intact.
        journey.visitId += 1;
        journey.projectVisitId += 1;
        journey.currentSection = null;
        journey.previousSection = null;
        journey.spokeVisitId = -1;
        journey.sectionVisits = {};
        journey.currentProject = null;
        journey.spokeProjectVisitId = -1;
        journey.projectVisits = {};
        journey.lastSpokeAt = Date.now() - COOLDOWN_MS;
        messageQueue.length = 0;
      },
      _journey: journey // inspectable state for debugging/tests
    };
  }

  /* -------------------------------------------------------------------------
     BOOT — wait for intro sequence to finish, then initialize storyteller
  --------------------------------------------------------------------------- */
  function boot() {
    // Check if intro is already done (session returning user)
    var introAlreadySeen = false;
    try { introAlreadySeen = sessionStorage.getItem("sara_intro_seen") === "true"; } catch(e) {}

    if (introAlreadySeen) {
      // Start immediately after short settle delay
      setTimeout(init, 600);
      return;
    }

    // Poll for intro completion (intro takes ~4.5s)
    var pollInterval = setInterval(function() {
      var introOverlay = document.getElementById("saraIntroOverlay");
      if (!introOverlay || introOverlay.classList.contains("dismissed")) {
        clearInterval(pollInterval);
        setTimeout(init, 800); // Short pause after intro finishes
      }
      // Also check via window.SARA.isIntroComplete()
      if (window.SARA && typeof window.SARA.isIntroComplete === "function" && window.SARA.isIntroComplete()) {
        clearInterval(pollInterval);
        setTimeout(init, 800);
      }
    }, 200);

    // Safety fallback — init after 6s regardless
    setTimeout(function() {
      clearInterval(pollInterval);
      if (!window.SARAStoryteller) init();
    }, 6000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();

/* =============================================================================
   SELECTED WORK + TOOLBOX INTERACTIONS
   - Project index: smooth focus + active state from viewport
   - Subtle image movement on scroll (object-position, no transform conflicts)
   - Skill explorer: technology → contextual panel → project links
   Respects prefers-reduced-motion. No new libraries.
   ============================================================================= */
(function () {
  "use strict";

  var reducedMotion = false;
  try { reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var isTouch = "ontouchstart" in window || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  function init() {
    initWorkIndex();
    initWorkParallax();
    initSkillExplorer();
  }

  /* ---------- Project index: active state + smooth focus ---------- */
  function initWorkIndex() {
    var items = document.querySelectorAll(".work-item[id]");
    var links = document.querySelectorAll("[data-work-link]");
    if (!items.length || !links.length) return;

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var target = document.getElementById(link.getAttribute("data-work-link"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        try { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); } catch (err) {}
      });
    });

    if (!("IntersectionObserver" in window)) {
      links[0].classList.add("active");
      return;
    }

    var linkById = {};
    links.forEach(function (link) { linkById[link.getAttribute("data-work-link")] = link; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (l) { l.classList.remove("active"); });
        if (linkById[id]) linkById[id].classList.add("active");
      });
    }, { threshold: 0.3, rootMargin: "-20% 0px -55% 0px" });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- Subtle image movement on scroll ---------- */
  function initWorkParallax() {
    if (reducedMotion || isTouch) return;
    var visuals = document.querySelectorAll(".work-visual .project-media-img");
    if (!visuals.length || !("IntersectionObserver" in window)) return;

    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || 800;
      visuals.forEach(function (img) {
        var rect = img.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var center = rect.top + rect.height / 2;
        var progress = (center - vh / 2) / (vh / 2); // -1 .. 1
        progress = Math.max(-1, Math.min(1, progress));
        img.style.objectPosition = "50% " + (50 + progress * 10).toFixed(2) + "%";
      });
    }
    function requestUpdate() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  }

  /* ---------- Skill explorer: technology → projects ---------- */
  function initSkillExplorer() {
    var chips = document.querySelectorAll(".tool-chip[data-skill]");
    var groups = document.querySelector(".toolbox-groups");
    var techEl = document.getElementById("skillPanelTech");
    var useEl = document.getElementById("skillPanelUse");
    if (!chips.length || !techEl || !useEl) return;

    var usedWrap = document.getElementById("skillPanelUsedWrap");
    var usedBox = document.getElementById("skillPanelUsed");
    var relatedWrap = document.getElementById("skillPanelRelatedWrap");
    var relatedBox = document.getElementById("skillPanelRelated");

    var projectTitles = {};
    document.querySelectorAll(".work-item[id]").forEach(function (item) {
      var title = item.querySelector(".work-title");
      projectTitles[item.id] = title ? title.textContent.trim() : item.id;
    });

    function projectLink(id) {
      var a = document.createElement("a");
      a.className = "toolbox-link";
      a.href = "#" + id;
      a.setAttribute("data-jump", id);
      var short = (projectTitles[id] || id).split("—")[0].trim();
      a.innerHTML = "";
      var label = document.createElement("span");
      label.textContent = "→ " + short;
      a.appendChild(label);
      a.addEventListener("click", function (e) {
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        if (!reducedMotion) {
          target.classList.remove("flash-focus");
          void target.offsetWidth;
          target.classList.add("flash-focus");
          setTimeout(function () { target.classList.remove("flash-focus"); }, 1700);
        }
      });
      return a;
    }

    function select(chip) {
      var skill = chip.getAttribute("data-skill");
      var use = chip.getAttribute("data-use") || "";
      var usedIds = (chip.getAttribute("data-used-in") || "").split(/\s+/).filter(Boolean);
      var relatedIds = (chip.getAttribute("data-related") || "").split(/\s+/).filter(Boolean);

      chips.forEach(function (c) { c.classList.remove("active", "related-match"); });
      chip.classList.add("active");

      // Dim unrelated: highlight chips sharing any project with this one
      if (groups) {
        groups.classList.add("has-selection");
        var myProjects = {};
        usedIds.concat(relatedIds).forEach(function (id) { myProjects[id] = true; });
        chips.forEach(function (c) {
          if (c === chip) return;
          var cUsed = (c.getAttribute("data-used-in") || "").split(/\s+/).filter(Boolean);
          var cRel = (c.getAttribute("data-related") || "").split(/\s+/).filter(Boolean);
          var shares = cUsed.concat(cRel).some(function (id) { return myProjects[id]; });
          if (shares) c.classList.add("related-match");
        });
      }

      techEl.textContent = skill;
      useEl.textContent = use;

      if (usedBox && usedWrap) {
        usedBox.innerHTML = "";
        if (usedIds.length) {
          usedIds.forEach(function (id) {
            if (document.getElementById(id)) usedBox.appendChild(projectLink(id));
          });
          usedWrap.hidden = !usedBox.children.length;
        } else {
          usedWrap.hidden = true;
        }
      }

      if (relatedBox && relatedWrap) {
        relatedBox.innerHTML = "";
        if (relatedIds.length) {
          relatedIds.forEach(function (id) {
            if (document.getElementById(id)) relatedBox.appendChild(projectLink(id));
          });
          relatedWrap.hidden = !relatedBox.children.length;
        } else {
          relatedWrap.hidden = true;
        }
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () { select(chip); });
      if (!isTouch) {
        chip.addEventListener("mouseenter", function () {
          if (!document.querySelector(".tool-chip.active")) select(chip);
        });
      }
      chip.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(chip); }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


