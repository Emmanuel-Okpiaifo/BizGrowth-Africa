import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const setCurrentDate = () => {
  const el = document.getElementById("current_date");
  if (!el) return;
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  el.textContent = `${days[now.getDay()]} , ${months[now.getMonth()]} ${now.getDate()} , ${now.getFullYear()}`;
};

const createScrollUpButton = () => {
  if (document.getElementById("scrollUp")) return null;
  const button = document.createElement("button");
  button.id = "scrollUp";
  button.className = "scrollUp";
  button.type = "button";
  button.innerHTML = '<i class="fa fa-angle-double-up"></i>';
  button.style.display = "none";
  document.body.appendChild(button);
  return button;
};

const initScrollUp = () => {
  const button = createScrollUpButton();
  if (!button) return () => {};

  const onScroll = () => {
    if (window.scrollY > 300) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  };

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", onScroll);
  button.addEventListener("click", onClick);
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    button.removeEventListener("click", onClick);
    button.remove();
  };
};

const initSearchToggle = () => {
  const buttons = document.querySelectorAll("#top-search-form .search-button");
  const handlers = [];

  buttons.forEach((button) => {
    const input = button.previousElementSibling;
    if (!input) return;
    const handler = (event) => {
      event.preventDefault();
      const isHidden =
        input.style.display === "none" ||
        getComputedStyle(input).display === "none";
      input.style.display = isHidden ? "block" : "none";
      input.style.opacity = isHidden ? "1" : "0";
    };
    button.addEventListener("click", handler);
    handlers.push({ button, handler });
  });

  return () => {
    handlers.forEach(({ button, handler }) => {
      button.removeEventListener("click", handler);
    });
  };
};

const initOffcanvasMenu = () => {
  const wrapper = document.getElementById("wrapper");
  const bodyWrapper = document.getElementById("offcanvas-body-wrapper");
  const openButton = document.querySelector("#side-menu-trigger a.menu-bar");
  const closeButton = document.querySelector("#side-menu-trigger a.menu-times");

  if (!wrapper || !openButton || !closeButton || !bodyWrapper) {
    return () => {};
  }

  const closeMenu = () => {
    wrapper.classList.remove("open");
    bodyWrapper.style.right = "";
    closeButton.classList.add("close");
    openButton.classList.remove("open");
    const mask = wrapper.querySelector(".offcanvas-mask");
    if (mask) mask.remove();
  };

  const openMenu = (event) => {
    event.preventDefault();
    if (!wrapper.classList.contains("open")) {
      const mask = document.createElement("div");
      mask.className = "offcanvas-mask";
      wrapper.appendChild(mask);
      mask.addEventListener("click", closeMenu);
    }
    wrapper.classList.add("open");
    openButton.classList.add("open");
    closeButton.classList.remove("close");
    bodyWrapper.style.right = "0";
  };

  const closeClick = (event) => {
    event.preventDefault();
    closeMenu();
  };

  const escHandler = (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  openButton.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeClick);
  document.addEventListener("keyup", escHandler);

  return () => {
    openButton.removeEventListener("click", openMenu);
    closeButton.removeEventListener("click", closeClick);
    document.removeEventListener("keyup", escHandler);
    closeMenu();
  };
};

const initIsotopeFilters = () => {
  const containers = document.querySelectorAll(".ne-isotope, .ne-isotope-all");
  const cleanups = [];

  containers.forEach((container) => {
    const filterLinks = container.querySelectorAll(
      ".isotope-classes-tab a[data-filter]"
    );
    const featured = container.querySelector(".featuredContainer");
    if (!featured || !filterLinks.length) return;

    const items = Array.from(featured.children);
    const setFilter = (filter) => {
      const target = filter === "*" ? null : filter.replace(".", "");
      items.forEach((item) => {
        if (!target) {
          item.style.display = "";
          return;
        }
        item.style.display = item.classList.contains(target) ? "" : "none";
      });
    };

    filterLinks.forEach((link) => {
      const handler = (event) => {
        event.preventDefault();
        filterLinks.forEach((item) => item.classList.remove("current"));
        link.classList.add("current");
        const filter = link.getAttribute("data-filter");
        setFilter(filter || "*");
      };
      link.addEventListener("click", handler);
      cleanups.push(() => link.removeEventListener("click", handler));
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
};

const initModalToggles = () => {
  const triggers = document.querySelectorAll('[data-toggle="modal"]');
  const cleanups = [];

  const openModal = (targetId) => {
    const modal = document.querySelector(targetId);
    if (!modal) return;
    modal.classList.add("show");
    modal.style.display = "block";
    document.body.classList.add("modal-open");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", () => closeModal(modal));
    modal.dataset.backdropId = "legacy-modal-backdrop";
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) backdrop.remove();
  };

  triggers.forEach((trigger) => {
    const targetId = trigger.getAttribute("data-target");
    if (!targetId) return;
    const handler = (event) => {
      event.preventDefault();
      openModal(targetId);
    };
    trigger.addEventListener("click", handler);
    cleanups.push(() => trigger.removeEventListener("click", handler));
  });

  const dismissers = document.querySelectorAll('[data-dismiss="modal"]');
  dismissers.forEach((button) => {
    const modal = button.closest(".modal");
    if (!modal) return;
    const handler = (event) => {
      event.preventDefault();
      closeModal(modal);
    };
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });

  return () => {
    cleanups.forEach((fn) => fn());
    document.querySelectorAll(".modal").forEach((modal) => closeModal(modal));
  };
};

const initCollapseToggles = () => {
  const triggers = document.querySelectorAll('[data-toggle="collapse"]');
  const cleanups = [];

  triggers.forEach((trigger) => {
    const targetId = trigger.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    const target = document.querySelector(targetId);
    if (!target) return;

    const handler = (event) => {
      event.preventDefault();
      target.classList.toggle("show");
    };

    trigger.addEventListener("click", handler);
    cleanups.push(() => trigger.removeEventListener("click", handler));
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
};

const initCarousels = () => {
  const carousels = document.querySelectorAll(".ne-carousel");
  const cleanups = [];

  const getItemsForWidth = (carousel) => {
    const width = window.innerWidth;
    const attrs = carousel.dataset;
    if (width < 576 && attrs.rXSmall) return parseInt(attrs.rXSmall, 10);
    if (width < 768 && attrs.rXMedium) return parseInt(attrs.rXMedium, 10);
    if (width < 992 && attrs.rSmall) return parseInt(attrs.rSmall, 10);
    if (width < 1200 && attrs.rMedium) return parseInt(attrs.rMedium, 10);
    if (attrs.rLarge) return parseInt(attrs.rLarge, 10);
    if (attrs.items) return parseInt(attrs.items, 10);
    return 1;
  };

  carousels.forEach((carousel) => {
    if (carousel.dataset.reactCarousel === "true") return;
    carousel.dataset.reactCarousel = "true";

    const items = Array.from(carousel.children);
    const track = document.createElement("div");
    track.className = "ne-carousel-track";
    items.forEach((item) => track.appendChild(item));
    carousel.appendChild(track);
    carousel.classList.add("ne-carousel-react");

    const margin = parseInt(carousel.dataset.margin || "0", 10);
    const applySizing = () => {
      const count = getItemsForWidth(carousel);
      carousel.style.setProperty("--ne-carousel-items", String(count));
      carousel.style.setProperty("--ne-carousel-gap", `${margin}px`);
    };

    applySizing();
    window.addEventListener("resize", applySizing);
    cleanups.push(() => window.removeEventListener("resize", applySizing));

    if (carousel.dataset.nav === "true") {
      const nav = document.createElement("div");
      nav.className = "ne-carousel-nav";
      nav.style.left = "10px";

      const prevButton = document.createElement("button");
      prevButton.type = "button";
      prevButton.innerHTML = "&lsaquo;";

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.innerHTML = "&rsaquo;";

      nav.appendChild(prevButton);
      nav.appendChild(nextButton);
      carousel.appendChild(nav);

      const scrollByStep = (direction) => {
        const count = getItemsForWidth(carousel);
        const step = track.clientWidth / Math.max(count, 1);
        track.scrollBy({ left: step * direction, behavior: "smooth" });
      };

      const prevHandler = () => scrollByStep(-1);
      const nextHandler = () => scrollByStep(1);

      prevButton.addEventListener("click", prevHandler);
      nextButton.addEventListener("click", nextHandler);

      cleanups.push(() => {
        prevButton.removeEventListener("click", prevHandler);
        nextButton.removeEventListener("click", nextHandler);
        nav.remove();
      });
    }

    if (carousel.dataset.autoplay === "true") {
      const timeout = parseInt(carousel.dataset.autoplayTimeout || "5000", 10);
      const interval = window.setInterval(() => {
        const count = getItemsForWidth(carousel);
        const step = track.clientWidth / Math.max(count, 1);
        track.scrollBy({ left: step, behavior: "smooth" });
      }, timeout);
      cleanups.push(() => window.clearInterval(interval));
    }
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
};

const initTicker = () => {
  const tickers = document.querySelectorAll(".ticker");
  const cleanups = [];

  tickers.forEach((ticker) => {
    const interval = window.setInterval(() => {
      const first = ticker.firstElementChild;
      if (first) {
        ticker.appendChild(first);
      }
    }, 3000);
    cleanups.push(() => window.clearInterval(interval));
  });

  return () => cleanups.forEach((fn) => fn());
};

const initLightbox = () => {
  const triggers = document.querySelectorAll(".popup-youtube");
  const cleanups = [];

  const closeLightbox = () => {
    const existing = document.querySelector(".ne-lightbox");
    if (existing) existing.remove();
  };

  const openLightbox = (href) => {
    closeLightbox();
    const overlay = document.createElement("div");
    overlay.className = "ne-lightbox";
    const iframe = document.createElement("iframe");
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.src = href.replace("watch?v=", "embed/");
    overlay.appendChild(iframe);
    overlay.addEventListener("click", closeLightbox);
    document.body.appendChild(overlay);
  };

  triggers.forEach((trigger) => {
    const handler = (event) => {
      event.preventDefault();
      const href = trigger.getAttribute("href");
      if (!href) return;
      openLightbox(href);
    };
    trigger.addEventListener("click", handler);
    cleanups.push(() => trigger.removeEventListener("click", handler));
  });

  const escHandler = (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  };

  document.addEventListener("keyup", escHandler);
  cleanups.push(() => document.removeEventListener("keyup", escHandler));

  return () => {
    cleanups.forEach((fn) => fn());
    closeLightbox();
  };
};

export default function useTemplateInteractions() {
  const location = useLocation();

  useEffect(() => {
    setCurrentDate();
    const cleanups = [
      initScrollUp(),
      initSearchToggle(),
      initOffcanvasMenu(),
      initIsotopeFilters(),
      initModalToggles(),
      initCollapseToggles(),
      initCarousels(),
      initTicker(),
      initLightbox(),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, [location.pathname]);
}
