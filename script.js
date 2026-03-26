(function () {
  var sideButton = document.querySelector(".side-button");
  var commandCatalog = document.getElementById("command-catalog");
  var revealNodes = document.querySelectorAll(".reveal");
  var searchInput = document.getElementById("command-search");
  var commandCards = Array.prototype.slice.call(document.querySelectorAll(".catalog-card"));
  var commandCount = document.getElementById("command-count");
  var emptyState = document.getElementById("empty-state");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initSnowBackground() {
    var canvas = document.getElementById("snow-canvas");
    if (!canvas || reduceMotion) {
      return;
    }

    var context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    var deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
    var flakes = [];
    var frameId = null;

    function resizeCanvas() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      canvas.width = Math.floor(width * deviceRatio);
      canvas.height = Math.floor(height * deviceRatio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

      var count = Math.max(40, Math.min(140, Math.floor((width * height) / 14000)));
      flakes = Array.from({ length: count }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 0.8,
          speedY: Math.random() * 1.1 + 0.4,
          drift: (Math.random() - 0.5) * 0.8,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.01
        };
      });
    }

    function animate() {
      var width = canvas.width / deviceRatio;
      var height = canvas.height / deviceRatio;
      context.clearRect(0, 0, width, height);

      flakes.forEach(function (flake) {
        flake.y += flake.speedY;
        flake.x += flake.drift + Math.sin(flake.wobble) * 0.25;
        flake.wobble += flake.wobbleSpeed;

        if (flake.y - flake.radius > height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * width;
        }

        if (flake.x < -10) {
          flake.x = width + 10;
        } else if (flake.x > width + 10) {
          flake.x = -10;
        }

        context.beginPath();
        context.fillStyle = "rgba(236, 244, 255, 0.88)";
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fill();
      });

      frameId = window.requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pagehide", function () {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    });
  }

  function initNetBackground() {
    var canvas = document.getElementById("net-canvas");
    if (!canvas || reduceMotion) {
      return;
    }

    var context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    var deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var frameId = null;
    var pointer = { x: null, y: null };

    function resizeCanvas() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      canvas.width = Math.floor(width * deviceRatio);
      canvas.height = Math.floor(height * deviceRatio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

      var targetCount = Math.max(24, Math.min(58, Math.floor((width * height) / 30000)));
      nodes = Array.from({ length: targetCount }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.5 + 1
        };
      });
    }

    function animate() {
      var width = canvas.width / deviceRatio;
      var height = canvas.height / deviceRatio;
      context.clearRect(0, 0, width, height);

      for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) {
          node.vx *= -1;
        }

        if (node.y <= 0 || node.y >= height) {
          node.vy *= -1;
        }

        context.beginPath();
        context.fillStyle = "rgba(124, 169, 255, 0.82)";
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();

        for (var j = i + 1; j < nodes.length; j += 1) {
          var other = nodes[j];
          var dx = node.x - other.x;
          var dy = node.y - other.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          var maxDistance = 160;

          if (distance < maxDistance) {
            context.beginPath();
            context.strokeStyle = "rgba(120, 155, 255, " + ((1 - distance / maxDistance) * 0.22) + ")";
            context.lineWidth = 1;
            context.moveTo(node.x, node.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      }

      if (pointer.x !== null && pointer.y !== null) {
        nodes.forEach(function (node) {
          var dx = node.x - pointer.x;
          var dy = node.y - pointer.y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 180) {
            context.beginPath();
            context.strokeStyle = "rgba(100, 218, 253, " + ((1 - distance / 180) * 0.18) + ")";
            context.lineWidth = 1;
            context.moveTo(node.x, node.y);
            context.lineTo(pointer.x, pointer.y);
            context.stroke();
          }
        });
      }

      frameId = window.requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", function (event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    });
    window.addEventListener("mouseleave", function () {
      pointer.x = null;
      pointer.y = null;
    });
    window.addEventListener("pagehide", function () {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    });
  }

  function setCommandCount(value) {
    if (!commandCount) {
      return;
    }

    commandCount.textContent = value + (value === 1 ? " command" : " commands");
  }

  function filterCommands() {
    if (!searchInput) {
      return;
    }

    var query = searchInput.value.trim().toLowerCase();
    var visibleCount = 0;

    commandCards.forEach(function (card) {
      var text = ((card.getAttribute("data-command") || "") + " " + card.innerText).toLowerCase();
      var isVisible = !query || text.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    setCommandCount(visibleCount);

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterCommands);
    setCommandCount(commandCards.length);
  }

  initSnowBackground();
  initNetBackground();

  if (!window.IntersectionObserver) {
    revealNodes.forEach(function (node) {
      node.classList.add("is-visible");
    });
    return;
  }

  if (sideButton && commandCatalog) {
    var catalogObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          sideButton.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: 0.05
      }
    );

    catalogObserver.observe(commandCatalog);
  }

  if (revealNodes.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1
      }
    );

    revealNodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  }
}());
