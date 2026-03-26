(function () {
  var sideButton = document.querySelector(".side-button");
  var commandCatalog = document.getElementById("command-catalog");

  if (!sideButton || !commandCatalog || !window.IntersectionObserver) {
    return;
  }

  var observer = new IntersectionObserver(
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

  observer.observe(commandCatalog);
}());
