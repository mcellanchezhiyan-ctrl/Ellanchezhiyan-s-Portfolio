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
   SARA STORYTELLER — PHASE 2
   Reusable section-aware contextual storyteller widget
   Exposes: window.SARAStoryteller
   Architecture: IntersectionObserver + session-gated message queue
   ============================================================================= */
(function() {
  "use strict";

  /* -------------------------------------------------------------------------
     CONTENT REGISTRY
     Maps section IDs / project data-project values → SARA message configs.
     displayOnce: true  → only fire once per session
     autoHide: ms       → auto-close bubble after N ms (0 = stays open)
     delay: ms          → wait before showing (after scroll into view)
  --------------------------------------------------------------------------- */
  var SECTION_SCRIPTS = {
    "top": {
      message: "Hi again! I'll show you around Ellan's work.",
      displayOnce: true,
      autoHide: 5000,
      delay: 800
    },
    "about": {
      message: "Let me introduce you to Ellan.\n\nHe's an Artificial Intelligence & Data Science student who enjoys turning ideas into working systems.",
      displayOnce: true,
      autoHide: 7000,
      delay: 400
    },
    "skills": {
      message: "Here's the toolbox Ellan uses to build his projects.",
      displayOnce: true,
      autoHide: 5000,
      delay: 400
    },
    "projects": {
      message: "Let's explore what Ellan has built.",
      displayOnce: true,
      autoHide: 5000,
      delay: 400
    },
    "ai-projects": {
      message: "And here are his applied AI systems — built around real data and real usability.",
      displayOnce: true,
      autoHide: 5500,
      delay: 400
    },
    "contact": {
      message: "You made it to the end!\nWant to get in touch with Ellan?",
      displayOnce: true,
      autoHide: 7000,
      delay: 400
    }
  };

  /* Project-card hover scripts (data-project attribute) */
  var PROJECT_SCRIPTS = {
    "alpha": {
      greeting: "Oh, you found Alpha!",
      description: "A personal AI assistant built to work offline via Ollama, with multi-stage message processing for relevance and personalization.",
      displayOnce: true,
      autoHide: 7000
    },
    "codetrack": {
      greeting: "This is CodeTrack!",
      description: "A dashboard that tracks student coding activity across LeetCode and GitHub automatically.",
      displayOnce: true,
      autoHide: 7000
    },
    "knovaul": {
      greeting: "Here's KnoVault!",
      description: "Upload PDFs, slides and docs — get direct answers pulled from that material using RAG and an LLM.",
      displayOnce: true,
      autoHide: 7000
    }
  };

  var SESSION_PREFIX = "sara_st_seen_";
  var STORYTELLER_SHOWN_KEY = "sara_storyteller_active";

  /* -------------------------------------------------------------------------
     WIDGET STATE
  --------------------------------------------------------------------------- */
  var widget = null;
  var bubbleEl = null;
  var bubbleTextEl = null;
  var closeBtn = null;
  var avatarBtn = null;
  var eyeL = null;
  var eyeR = null;

  var isUserDismissed = false;  // user explicitly closed bubble this session
  var currentAutoHideTimer = null;
  var blinkInterval = null;
  var pendingQueue = [];         // messages waiting while widget is busy

  /* -------------------------------------------------------------------------
     SESSION HELPERS
  --------------------------------------------------------------------------- */
  function wasSeen(key) {
    try { return sessionStorage.getItem(SESSION_PREFIX + key) === "1"; } catch(e) { return false; }
  }
  function markSeen(key) {
    try { sessionStorage.setItem(SESSION_PREFIX + key, "1"); } catch(e) {}
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
     PUBLIC API: SARAStoryteller.say(config)
     config = { message, displayOnce, key, autoHide, delay }
  --------------------------------------------------------------------------- */
  function say(config) {
    if (!config || !config.message) return;
    var key = config.key || config.message.slice(0, 20);

    if (config.displayOnce && wasSeen(key)) return;
    if (isUserDismissed) {
      // Show notification dot but don't open automatically
      if (avatarBtn) avatarBtn.classList.add("has-message");
      return;
    }

    var delay = config.delay || 0;
    setTimeout(function() {
      showWidget();
      showBubble(config.message, config.autoHide != null ? config.autoHide : 5500);
      if (config.displayOnce) markSeen(key);
    }, delay);
  }

  /* -------------------------------------------------------------------------
     SECTION INTERSECTION OBSERVER
  --------------------------------------------------------------------------- */
  function initSectionObserver() {
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        var script = SECTION_SCRIPTS[id];
        if (!script) return;

        say({
          message: script.message,
          displayOnce: script.displayOnce !== false,
          key: "section_" + id,
          autoHide: script.autoHide != null ? script.autoHide : 5500,
          delay: script.delay || 0
        });
      });
    }, {
      threshold: 0.25,
      rootMargin: "0px 0px -10% 0px"
    });

    Object.keys(SECTION_SCRIPTS).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* -------------------------------------------------------------------------
     PROJECT CARD HOVER LISTENERS
  --------------------------------------------------------------------------- */
  function initProjectHovers() {
    var cards = document.querySelectorAll("[data-project]");
    cards.forEach(function(card) {
      var projectId = card.getAttribute("data-project");
      var script = PROJECT_SCRIPTS[projectId];
      if (!script) return;

      card.addEventListener("mouseenter", function() {
        if (wasSeen("project_" + projectId)) return;
        say({
          message: script.greeting + "\n\n" + script.description,
          displayOnce: script.displayOnce !== false,
          key: "project_" + projectId,
          autoHide: script.autoHide != null ? script.autoHide : 7000,
          delay: 300
        });
      });

      // Touch support
      card.addEventListener("touchstart", function() {
        if (wasSeen("project_" + projectId)) return;
        say({
          message: script.greeting + "\n\n" + script.description,
          displayOnce: script.displayOnce !== false,
          key: "project_" + projectId,
          autoHide: script.autoHide != null ? script.autoHide : 7000,
          delay: 300
        });
      }, { passive: true });
    });
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
        isUserDismissed = true;
        // Show notification dot so user knows SARA can still be opened
        if (avatarBtn) avatarBtn.classList.add("has-message");
      });
    }

    // Avatar click — toggle bubble or re-open last message
    if (avatarBtn) {
      avatarBtn.addEventListener("click", function() {
        if (bubbleEl && bubbleEl.classList.contains("active")) {
          hideBubble();
          isUserDismissed = true;
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
    initSectionObserver();
    initProjectHovers();

    // Show widget right away (hidden until first message or intro done)
    showWidget();

    // Expose extended public API for future use
    window.SARAStoryteller = {
      say: say,
      hide: hideBubble,
      show: showWidget,
      addSection: function(id, config) { SECTION_SCRIPTS[id] = config; },
      addProject: function(id, config) { PROJECT_SCRIPTS[id] = config; },
      reset: function(key) {
        try { sessionStorage.removeItem(SESSION_PREFIX + key); } catch(e) {}
      }
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


