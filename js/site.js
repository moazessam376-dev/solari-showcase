(function () {
  "use strict";

  var command = "solci run moazessam376-dev/Gym-App --job typecheck --cpu 1,2,4";
  var terminalTimers = [];
  var interactiveTerminalState = {
    active: false,
    command: "",
    history: [],
    historyIndex: 0,
    hintDismissed: false,
    streamTimers: []
  };

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

  function clearInteractiveStreamTimers() {
    interactiveTerminalState.streamTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    interactiveTerminalState.streamTimers = [];
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
    activateInteractiveTerminal(false);
  }

  function runTerminal() {
    var typed = document.getElementById("typed-command");
    var lines = Array.prototype.slice.call(document.querySelectorAll(".terminal-seq-line"));
    var results = document.getElementById("terminal-results");
    var screen = document.querySelector(".terminal-screen");
    if (!typed || !results) return;

    resetInteractiveTerminal();

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
      activateInteractiveTerminal(false);
    }, streamStart + lastDelay + 430);
    terminalTimers.push(resultsTimer);
  }

  function scrollTerminalToBottom() {
    var screen = document.querySelector(".terminal-screen");
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  function setInteractiveCommand(value) {
    var input = document.getElementById("terminal-input");
    var liveCommand = document.getElementById("terminal-live-command");
    var hint = document.getElementById("terminal-hint");
    interactiveTerminalState.command = value;
    if (input && input.value !== value) input.value = value;
    if (liveCommand) liveCommand.textContent = value;
    if (hint && value) {
      interactiveTerminalState.hintDismissed = true;
      hint.classList.add("is-dismissed");
    }
  }

  function activateInteractiveTerminal(focusInput) {
    var interactive = document.getElementById("terminal-interactive");
    var hint = document.getElementById("terminal-hint");
    var input = document.getElementById("terminal-input");
    if (!interactive) return;

    interactiveTerminalState.active = true;
    interactive.classList.add("is-active");
    if (hint && !interactiveTerminalState.hintDismissed && !interactiveTerminalState.command) {
      hint.classList.remove("is-dismissed");
    }
    if (focusInput && input) input.focus();
    scrollTerminalToBottom();
  }

  function resetInteractiveTerminal() {
    var interactive = document.getElementById("terminal-interactive");
    var hint = document.getElementById("terminal-hint");
    var output = document.getElementById("terminal-output");
    var input = document.getElementById("terminal-input");
    var liveCommand = document.getElementById("terminal-live-command");

    clearInteractiveStreamTimers();
    interactiveTerminalState.active = false;
    interactiveTerminalState.command = "";
    interactiveTerminalState.history = [];
    interactiveTerminalState.historyIndex = 0;
    interactiveTerminalState.hintDismissed = false;
    if (interactive) interactive.classList.remove("is-active");
    if (hint) hint.classList.remove("is-dismissed");
    if (output) output.textContent = "";
    if (input) input.value = "";
    if (liveCommand) liveCommand.textContent = "";
  }

  function beginInteractiveTerminal(focusInput) {
    if (!interactiveTerminalState.active) {
      clearTerminalTimers();
      showTerminalFinalState();
    }
    activateInteractiveTerminal(focusInput);
  }

  function appendInteractiveLine(text, extraClass) {
    var output = document.getElementById("terminal-output");
    if (!output) return;
    var line = document.createElement("div");
    line.className = "terminal-interactive-line" + (extraClass ? " " + extraClass : "");
    line.textContent = text;
    output.appendChild(line);
  }

  function appendInteractiveCommand(text) {
    var output = document.getElementById("terminal-output");
    if (!output) return;
    var line = document.createElement("div");
    var prompt = document.createElement("span");
    var commandText = document.createElement("span");
    line.className = "terminal-interactive-command";
    prompt.className = "terminal-prompt";
    prompt.textContent = "moaz@solari ~ % ";
    commandText.textContent = text;
    line.appendChild(prompt);
    line.appendChild(commandText);
    output.appendChild(line);
  }

  function getInteractiveCommandLines(value) {
    if (value === "help") {
      return [
        "SUPPORTED COMMANDS",
        "  help",
        "  solci doctor",
        "  solci inspect crosstalk",
        "  solci run gym-app --cpu 1,2,4",
        "  solci run crosstalk --cpu 1,2",
        "  solci agent gym-app --pr",
        "  clear"
      ];
    }

    if (value === "solci doctor") {
      return [
        "PASS  solari api reachable",
        "PASS  github token valid",
        "PASS  gh cli found"
      ];
    }

    if (value === "solci inspect crosstalk") {
      return [
        "workflow         ci.yml",
        "job              test",
        "matrix           yes",
        "baseline median  122 s",
        "p90              160 s",
        "failure rate     17%",
        "findings         NO_TIMEOUT, MATRIX_NOTE"
      ];
    }

    if (value === "solci run gym-app --cpu 1,2,4") {
      return [
        "1 vCPU",
        "  actions/checkout@v7       3.0s",
        "  actions/setup-node@v6     5.4s",
        "  npm ci                    34.0s",
        "  npm run typecheck         23.7s",
        "2 vCPU",
        "  actions/checkout@v7       2.9s",
        "  actions/setup-node@v6     5.2s",
        "  npm ci                    22.8s",
        "  npm run typecheck         16.5s",
        "4 vCPU",
        "  actions/checkout@v7       2.8s",
        "  actions/setup-node@v6     5.1s",
        "  npm ci                    20.6s",
        "  npm run typecheck         13.9s",
        "RESULTS / Gym-App / typecheck",
        "size     boot   cpu online   total    solari/run  solari/month  speedup",
        "1 vCPU   1.1s   0.0s         67.1s    $0.0011     $0.0182       1.00x",
        "2 vCPU   0.8s   0.4s         48.5s    $0.0012     $0.0212       1.38x",
        "4 vCPU   0.3s   2.6s         45.5s    $0.0023     $0.0399       1.47x",
        "GitHub baseline  median 39.0s  p90 57.0s  20 runs  $0.0100/run  17.1 runs/month",
        "RECOMMENDATION  Use 2 vCPU: 48 s for $0.0012 per run, within 10% of the 4 vCPU time (46 s) at 53% of its cost."
      ];
    }

    if (value === "solci run crosstalk --cpu 1,2") {
      return [
        "1 vCPU   total 191.5 s   solari/run $0.0030",
        "2 vCPU   total 197.5 s   solari/run $0.0050",
        "RECOMMENDATION  Use 1 vCPU",
        "4 and 8 vCPU failed in the repo's own test suite (flaky test)."
      ];
    }

    if (value === "solci agent gym-app --pr") {
      return [
        "measuring...",
        "proposing...",
        "DIFF / .github/workflows/ci.yml",
        "@@ workflow top level",
        "+concurrency:",
        "+  group: ci-${{ github.ref }}",
        "+  cancel-in-progress: true",
        " jobs:",
        "   typecheck:",
        "+    timeout-minutes: 15",
        "15 minutes is safely above the 58 second p90; cancel superseded runs given 35% historical failures",
        "PR opened: (demo)"
      ];
    }

    return ["solci: unknown command, try help"];
  }

  function streamInteractiveLines(lines) {
    clearInteractiveStreamTimers();
    if (isReducedMotion()) {
      lines.forEach(function (line) {
        appendInteractiveLine(line, line.charAt(0) === "+" ? "diff-added" : "");
      });
      scrollTerminalToBottom();
      return;
    }

    lines.forEach(function (line, index) {
      var timer = window.setTimeout(function () {
        appendInteractiveLine(line, line.charAt(0) === "+" ? "diff-added" : "");
        scrollTerminalToBottom();
      }, index * 40);
      interactiveTerminalState.streamTimers.push(timer);
    });
  }

  function submitInteractiveCommand(rawValue) {
    var value = String(rawValue || "").trim();
    if (!value) return;

    beginInteractiveTerminal(false);
    interactiveTerminalState.history.push(value);
    interactiveTerminalState.historyIndex = interactiveTerminalState.history.length;
    interactiveTerminalState.hintDismissed = true;
    setInteractiveCommand("");

    var hint = document.getElementById("terminal-hint");
    var output = document.getElementById("terminal-output");
    if (hint) hint.classList.add("is-dismissed");
    if (value === "clear") {
      clearInteractiveStreamTimers();
      if (output) output.textContent = "";
      scrollTerminalToBottom();
      return;
    }

    appendInteractiveCommand(value);
    streamInteractiveLines(getInteractiveCommandLines(value));
    scrollTerminalToBottom();
  }

  function handleInteractiveHistory(key) {
    var history = interactiveTerminalState.history;
    var nextValue = "";
    if (!history.length) return;

    if (key === "ArrowUp") {
      if (interactiveTerminalState.historyIndex > 0) interactiveTerminalState.historyIndex -= 1;
      nextValue = history[interactiveTerminalState.historyIndex] || "";
    } else if (key === "ArrowDown") {
      if (interactiveTerminalState.historyIndex < history.length - 1) {
        interactiveTerminalState.historyIndex += 1;
        nextValue = history[interactiveTerminalState.historyIndex] || "";
      } else {
        interactiveTerminalState.historyIndex = history.length;
      }
    }
    setInteractiveCommand(nextValue);
  }

  function handleInteractiveKeydown(event) {
    var isScreen = event.currentTarget.classList.contains("terminal-screen");
    if (!interactiveTerminalState.active) beginInteractiveTerminal(false);

    if (event.key === "Enter") {
      event.preventDefault();
      submitInteractiveCommand(isScreen ? interactiveTerminalState.command : event.currentTarget.value);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      handleInteractiveHistory(event.key);
      return;
    }

    if (isScreen && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key === "Backspace") {
        event.preventDefault();
        setInteractiveCommand(interactiveTerminalState.command.slice(0, -1));
      } else if (event.key.length === 1) {
        event.preventDefault();
        setInteractiveCommand(interactiveTerminalState.command + event.key);
      }
    }
  }

  function setupInteractiveTerminal() {
    var screen = document.querySelector(".terminal-screen");
    var input = document.getElementById("terminal-input");
    var chips = document.querySelectorAll("[data-terminal-command]");
    if (!screen || !input) return;

    screen.addEventListener("focus", function () {
      beginInteractiveTerminal(false);
    });
    screen.addEventListener("click", function (event) {
      if (event.target !== input) beginInteractiveTerminal(true);
    });
    screen.addEventListener("keydown", handleInteractiveKeydown);
    input.addEventListener("input", function () {
      interactiveTerminalState.historyIndex = interactiveTerminalState.history.length;
      setInteractiveCommand(input.value);
    });
    input.addEventListener("keydown", function (event) {
      event.stopPropagation();
      handleInteractiveKeydown(event);
    });
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        submitInteractiveCommand(chip.getAttribute("data-terminal-command") || "");
      });
    });
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

  function formatCount(value, decimals) {
    var places = Number(decimals);
    if (!isFinite(places) || places < 0) places = 0;
    return Number(value).toFixed(places);
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
      var statDecimals = Number(stat.getAttribute("data-decimals"));
      var statTarget = Number(stat.getAttribute("data-count"));
      if (!isFinite(statTarget)) statTarget = 0;
      stat.textContent = formatCount(0, statDecimals);
      window.gsap.to(statProxy, {
        value: statTarget,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: ".curve-note", start: "top 92%", once: true },
        onUpdate: function () {
          stat.textContent = formatCount(statProxy.value, statDecimals);
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
    if (stat) {
      var statTarget = Number(stat.getAttribute("data-count"));
      if (!isFinite(statTarget)) statTarget = 0;
      stat.textContent = formatCount(statTarget, stat.getAttribute("data-decimals"));
    }
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
    setupInteractiveTerminal();
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
