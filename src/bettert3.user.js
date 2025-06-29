// ==UserScript==
// @name         BetterT3
// @namespace    http://tampermonkey.net/
// @version      2025.01.02
// @description  T3.chat tweaks!
// @author       2lay
// @match        https://t3.chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t3.chat
// @updateURL    https://github.com/2lay/bettert3/raw/main/src/bettert3.user.js
// @downloadURL  https://github.com/2lay/bettert3/raw/main/src/bettert3.user.js
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  "use strict";

  const BETTER_T3_TAB_ID = "better-t3-tabb";
  const BETTER_T3_CONTENT_ID = "radix-:r3:-content-bettert3";
  const THEME_HUE_STORAGE_KEY = "betterT3_themeHue";
  const CSS_URL =
    "https://raw.githubusercontent.com/2lay/bettert3/refs/heads/main/src/bettert3.user.css";

  function applyThemeHue() {
    const savedHue = localStorage.getItem(THEME_HUE_STORAGE_KEY);
    if (savedHue !== null) {
      document.documentElement.style.setProperty("--theme-hue", savedHue);
    } else {
      document.documentElement.style.removeProperty("--theme-hue");
    }
  }

  applyThemeHue();

  const htmlObserver = new MutationObserver((mutations) => {
    let reapplyNeeded = false;
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const currentHueCSSVar = document.documentElement.style.getPropertyValue(
          "--theme-hue"
        );
        const savedHue = localStorage.getItem(THEME_HUE_STORAGE_KEY);

        if (savedHue !== null && currentHueCSSVar !== savedHue) {
          reapplyNeeded = true;
          break;
        } else if (savedHue === null && currentHueCSSVar !== "") {
          reapplyNeeded = true;
          break;
        }
      }
    }
    if (reapplyNeeded) {
      applyThemeHue();
    }
  });

  htmlObserver.observe(document.documentElement, { attributes: true });

  // Function to inject CSS from a URL
  function injectExternalCSS(url) {
    GM.xmlHttpRequest({
      method: "GET",
      url: url,
      onload: function (response) {
        if (response.status === 200) {
          const styleElement = document.createElement("style");
          styleElement.textContent = response.responseText;
          document.head.appendChild(styleElement);
        } else {
          console.error(
            `BetterT3: Failed to load external CSS from ${url}. Status: ${response.status}`
          );
        }
      },
      onerror: function (error) {
        console.error(
          `BetterT3: Error loading external CSS from ${url}:`,
          error
        );
      },
    });
  }

  // Inject the external CSS when the script runs
  injectExternalCSS(CSS_URL);

  function createBetterT3Content() {
    const betterT3Content = document.createElement("div");
    betterT3Content.setAttribute("data-state", "inactive");
    betterT3Content.setAttribute("data-orientation", "horizontal");
    betterT3Content.role = "tabpanel";
    betterT3Content.setAttribute("aria-labelledby", BETTER_T3_TAB_ID);
    betterT3Content.id = BETTER_T3_CONTENT_ID;
    betterT3Content.tabIndex = 0;
    betterT3Content.classList.add("mt-2", "space-y-8");
    betterT3Content.hidden = true;

    const currentHueForInput =
      localStorage.getItem(THEME_HUE_STORAGE_KEY) || "220";

    // The inline style for the hue slider is now removed from here
    // as it will be loaded from the external CSS file.
    betterT3Content.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-2xl font-bold">Welcome to BetterT3 Settings!</h2>
            <p>Made by @twolays on Twitter!</p>
            <div class="space-y-4 md:max-w-lg">
                <div class="block rounded-lg border border-secondary p-4">
                    <div class="flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paint-roller-icon lucide-paint-roller h-5 w-5 text-primary">
                            <rect width="16" height="6" x="2" y="2" rx="2"/>
                            <path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                            <rect width="4" height="6" x="8" y="16" rx="1"/>
                        </svg>
                        <div class="flex-grow">
                            <h3 class="font-medium">Theme Hue</h3>
                            <p class="text-sm text-muted-foreground/80 mb-2">Adjust the primary color hue of the interface (0-360).</p>
                            <input id="theme-hue-input"
                                type="range"
                                min="0"
                                max="360"
                                value="${currentHueForInput}"
                                aria-label="Theme Hue">
                            <div class="text-right text-sm text-muted-foreground/80 mt-1">Current Hue: <span id="theme-hue-display">${currentHueForInput}</span></div>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <a href="https://github.com/2lay/bettert3" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github-icon lucide-github mr-2 h-4 w-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        GitHub
                    </a>
                    <a href="https://twitter.com/twolays" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 px-4 py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter-icon lucide-twitter mr-2 h-4 w-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        Twitter
                    </a>
                </div>
            </div>
        </div>
    `;

    const themeHueInput = betterT3Content.querySelector("#theme-hue-input");
    const themeHueDisplay = betterT3Content.querySelector("#theme-hue-display");

    themeHueInput.addEventListener("input", (event) => {
      const hue = event.target.value;
      localStorage.setItem(THEME_HUE_STORAGE_KEY, hue);
      applyThemeHue();
      themeHueDisplay.textContent = hue;
    });

    themeHueDisplay.textContent = currentHueForInput;

    return betterT3Content;
  }

  function addBetterT3TabAndContent() {
    const tabList = document.querySelector(
      'div[role="tablist"][aria-orientation="horizontal"]'
    );
    const settingsMainContainer = document.querySelector(
      'div[dir="ltr"][data-orientation="horizontal"].space-y-6'
    );

    if (tabList && settingsMainContainer) {
      let betterT3Button = tabList.querySelector(
        `button[id="${BETTER_T3_TAB_ID}"]`
      );
      let betterT3Content = document.getElementById(BETTER_T3_CONTENT_ID);

      if (!betterT3Button) {
        betterT3Button = document.createElement("button");
        betterT3Button.type = "button";
        betterT3Button.role = "tab";
        betterT3Button.setAttribute("aria-selected", "false");
        betterT3Button.setAttribute("aria-controls", BETTER_T3_CONTENT_ID);
        betterT3Button.setAttribute("data-state", "inactive");
        betterT3Button.id = BETTER_T3_TAB_ID;
        betterT3Button.classList.add(
          "inline-flex",
          "items-center",
          "justify-center",
          "whitespace-nowrap",
          "rounded-md",
          "px-2.5",
          "py-1",
          "text-sm",
          "font-medium",
          "ring-offset-background",
          "transition-all",
          "hover:bg-sidebar-accent/40",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          "disabled:pointer-events-none",
          "disabled:opacity-50"
        );
        betterT3Button.tabIndex = -1;
        betterT3Button.setAttribute("data-orientation", "horizontal");
        betterT3Button.setAttribute("data-radix-collection-item", "");
        betterT3Button.textContent = "BetterT3";

        tabList.appendChild(betterT3Button);
      }

      if (!betterT3Content) {
        betterT3Content = createBetterT3Content();
        settingsMainContainer.appendChild(betterT3Content);
      }

      betterT3Button.onclick = (event) => {
        event.preventDefault();
        setActiveTab(BETTER_T3_TAB_ID);
        history.pushState(
          { tab: BETTER_T3_TAB_ID },
          "",
          "/settings/bettert3"
        );
      };

      updateActiveTabFromURL();
    }
  }

  function setActiveTab(activeButtonId) {
    const tabButtons = document.querySelectorAll(
      'div[role="tablist"] button[role="tab"]'
    );
    const tabContents = document.querySelectorAll('div[role="tabpanel"]');

    tabButtons.forEach((button) => {
      const isCurrentlyActive = button.id === activeButtonId;

      button.setAttribute("aria-selected", isCurrentlyActive);
      button.setAttribute(
        "data-state",
        isCurrentlyActive ? "active" : "inactive"
      );
      if (isCurrentlyActive) {
        button.classList.add("bg-background", "text-foreground", "shadow");
        button.tabIndex = 0;
      } else {
        button.classList.remove("bg-background", "text-foreground", "shadow");
        button.tabIndex = -1;
      }
    });

    tabContents.forEach((content) => {
      const contentControlledBy = content.getAttribute("aria-labelledby");
      let contentShouldBeVisible = false;

      if (contentControlledBy === activeButtonId) {
        contentShouldBeVisible = true;
      } else if (
        content.id === BETTER_T3_CONTENT_ID &&
        activeButtonId === BETTER_T3_TAB_ID
      ) {
        contentShouldBeVisible = true;
      }

      content.hidden = !contentShouldBeVisible;
      content.setAttribute(
        "data-state",
        contentShouldBeVisible ? "active" : "inactive"
      );
    });
  }

  function updateActiveTabFromURL() {
    const currentPath = window.location.pathname;
    let targetButtonId = null;

    if (currentPath.startsWith("/settings/bettert3")) {
      targetButtonId = BETTER_T3_TAB_ID;
    } else {
      const match = currentPath.match(
        /\/settings\/(account|customization|history|models|api-keys|attachments|contact)/
      );
      if (match && match[1]) {
        targetButtonId = `radix-:r3:-trigger-${match[1]}`;
      } else if (currentPath === "/settings" || currentPath === "/settings/") {
        targetButtonId = "radix-:r3:-trigger-contact";
      }
    }

    if (targetButtonId) {
      const buttonToActivate = document.getElementById(targetButtonId);
      if (buttonToActivate) {
        setActiveTab(buttonToActivate.id);
      }
    }
  }

  const observer = new MutationObserver((mutations, obs) => {
    const tabList = document.querySelector(
      'div[role="tablist"][aria-orientation="horizontal"]'
    );
    const settingsMainContainer = document.querySelector(
      'div[dir="ltr"][data-orientation="horizontal"].space-y-6'
    );

    if (tabList && settingsMainContainer) {
      addBetterT3TabAndContent();
      obs.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(history, arguments);
    updateActiveTabFromURL();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(history, arguments);
    updateActiveTabFromURL();
  };

  window.addEventListener("popstate", updateActiveTabFromURL);

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    addBetterT3TabAndContent();
  } else {
    document.addEventListener("DOMContentLoaded", addBetterT3TabAndContent);
  }

  window.addEventListener("load", updateActiveTabFromURL);
})();
