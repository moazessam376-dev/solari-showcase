(function () {
  "use strict";

  var command = "solci run moazessam376-dev/Gym-App --job typecheck --cpu 1,2,4";
  var terminalTimers = [];

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function hasAnimationLibraries() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function clearTerminalTimers() {
    terminalTimers.forEach(function (timer) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    terminalTimers = [];
  }

  function showTerminalFinalState() {
    var typed = document.getElementById("typed-command");
    var lines = document.querySelectorAll(".terminal-seq-line");
    var results = document.getElementById("terminal-results");
    typed.textContent = command;
    lines.forEach(function (line) {
      line.classList.add("is-visible");
    });
    results.classList.remove("terminal-hidden");
  }

  function runTerminal() {
    var typed = document.getElementById("typed-command");
    var lines = Array.prototype.slice.call(document.querySelectorAll(".terminal-seq-line"));
    var results = document.getElementById("terminal-results");
    var screen = document.querySelector(".terminal-screen");
    if (!typed || !results) return;

    if (isReducedMotion() || !hasAnimationLibraries()) {
      showTerminalFinalState();
      return;
    }

    clearTerminalTimers();
    typed.textContent = "";
    lines.forEach(function (line) {
      line.classList.remove("is-visible");
    });
    results.classList.add("terminal-hidden");
    if (screen) screen.scrollTop = 0;

    var index = 0;
    var typeSpeed = 22;
    var typeTimer = window.setInterval(function () {
      typed.textContent = command.slice(0, index + 1);
      index += 1;
      if (index >= command.length) {
        window.clearInterval(typeTimer);
      }
    }, typeSpeed);
    terminalTimers.push(typeTimer);

    var streamStart = command.length * typeSpeed + 260;
    lines.forEach(function (line) {
      var delay = Number(line.getAttribute("data-delay")) || 0;
      var timer = window.setTimeout(function () {
        line.classList.add("is-visible");
        if (screen) screen.scrollTop = screen.scrollHeight;
      }, streamStart + delay);
      terminalTimers.push(timer);
    });

    var lastDelay = Number(lines[lines.length - 1].getAttribute("data-delay")) || 0;
    var resultsTimer = window.setTimeout(function () {
      results.classList.remove("terminal-hidden");
      if (screen) screen.scrollTop = screen.scrollHeight;
    }, streamStart + lastDelay + 430);
    terminalTimers.push(resultsTimer);
  }

  function updateScrollProgress() {
    var progress = document.querySelector(".scroll-progress span");
    if (!progress) return;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.width = Math.min(100, Math.max(0, ratio * 100)) + "%";
  }

  function formatCost(value) {
    return "$" + value.toFixed(4);
  }

  function setupChart() {
    var groups = Array.prototype.slice.call(document.querySelectorAll(".bar-group"));
    var maxValue = 70;
    groups.forEach(function (group) {
      var value = Number(group.getAttribute("data-value"));
      var fill = group.querySelector(".bar-fill");
      var height = (value / maxValue) * 100;
      group.style.setProperty("--bar-height", height + "%");
      if (!fill) return;

      if (isReducedMotion()) {
        fill.style.height = height + "%";
      }
    });
  }

  function setupAnimations() {
    if (isReducedMotion() || !hasAnimationLibraries()) return;

    document.body.classList.add("gsap-ready");
    window.gsap.registerPlugin(window.ScrollTrigger);

    var revealElements = window.gsap.utils.toArray(".reveal");
    window.gsap.set(revealElements, { opacity: 0, y: 24 });
    revealElements.forEach(function (element, index) {
      window.gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.72,
        delay: index < 2 ? index * 0.05 : 0,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 92%", once: true }
      });
    });

    var groups = window.gsap.utils.toArray(".bar-group");
    groups.forEach(function (group, index) {
      var fill = group.querySelector(".bar-fill");
      var costLabel = group.querySelector(".bar-cost");
      var targetHeight = group.style.getPropertyValue("--bar-height");
      var targetCost = Number(group.getAttribute("data-cost"));
      var proxy = { value: 0 };
      if (fill) window.gsap.set(fill, { height: 0 });
      if (costLabel) costLabel.textContent = "$0.0000";
      var tweenSettings = {
        height: targetHeight,
        duration: 1.1,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".curve-chart", start: "top 92%", once: true }
      };
      if (fill) window.gsap.to(fill, tweenSettings);
      if (costLabel) {
        window.gsap.to(proxy, {
          value: targetCost,
          duration: 1.1,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ".curve-chart", start: "top 92%", once: true },
          onUpdate: function () {
            costLabel.textContent = formatCost(proxy.value);
          }
        });
      }
    });

    var stat = document.querySelector(".count-up");
    if (stat) {
      var statProxy = { value: 0 };
      stat.textContent = "0";
      window.gsap.to(statProxy, {
        value: Number(stat.getAttribute("data-count")) || 8,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: ".curve-note", start: "top 92%", once: true },
        onUpdate: function () {
          stat.textContent = Math.round(statProxy.value).toString();
        }
      });
    }

    window.ScrollTrigger.refresh();
  }

  function forceAnimationsVisible() {
    if (!hasAnimationLibraries()) return;

    clearTerminalTimers();
    document.querySelectorAll(".reveal").forEach(function (element) {
      window.gsap.set(element, { opacity: 1, y: 0 });
    });
    document.querySelectorAll(".bar-group").forEach(function (group) {
      var fill = group.querySelector(".bar-fill");
      var costLabel = group.querySelector(".bar-cost");
      if (fill) window.gsap.set(fill, { height: group.style.getPropertyValue("--bar-height") });
      if (costLabel) costLabel.textContent = formatCost(Number(group.getAttribute("data-cost")));
    });

    var stat = document.querySelector(".count-up");
    if (stat) stat.textContent = (Number(stat.getAttribute("data-count")) || 8).toString();
    showTerminalFinalState();
  }

  function setupSafetyNet() {
    if (!hasAnimationLibraries()) return;
    window.setTimeout(forceAnimationsVisible, 2500);
  }

  function refreshAnimations() {
    if (hasAnimationLibraries()) window.ScrollTrigger.refresh();
  }

  function setupCopyButtons() {
    document.querySelectorAll(".copy-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-copy") || "";
        var done = function () {
          button.textContent = "copied";
          button.classList.add("is-copied");
          window.setTimeout(function () {
            button.textContent = "copy";
            button.classList.remove("is-copied");
          }, 1400);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done).catch(function () {
            doneWithFallback(value, done);
          });
        } else {
          doneWithFallback(value, done);
        }
      });
    });
  }

  function doneWithFallback(value, done) {
    var input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      // The command is still visible for manual copying if the browser blocks clipboard access.
    }
    input.remove();
    done();
  }

  function init() {
    document.body.classList.add("js-ready");
    setupChart();
    setupAnimations();
    setupCopyButtons();
    runTerminal();
    setupSafetyNet();
    window.addEventListener("load", refreshAnimations);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshAnimations);
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    var replay = document.getElementById("replay-button");
    if (replay) replay.addEventListener("click", runTerminal);
  }

  document.addEventListener("DOMContentLoaded", init);
}());
