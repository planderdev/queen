import * as r from "./admin-preferences.js";
import {esc,icon} from './admin-renderers.js';
export let adminMenus=[];
let adminGroups=[];
export function setAdminMenus(items){
  const groups={'dashboard':'운영 현황','users':'회원·단체','organizations':'회원·단체','fundraisers':'모금·심사','reports':'모금·심사','transactions':'후원·정산','recurring':'후원·정산','refunds':'후원·정산','payouts':'후원·정산','campaigns':'후원·정산','content':'콘텐츠·소통','moderation':'콘텐츠·소통','inquiries':'콘텐츠·소통','settings':'설정','permissions':'설정','logs':'설정'};
  const icons={"layout-dashboard": "dashboard-line", "users": "user-line", "building-2": "building-line", "heart-handshake": "hand-heart-line", "receipt": "receipt-line", "calendar-days": "calendar-line", "undo-2": "arrow-go-back-line", "wallet": "wallet-line", "file-check-2": "file-check-line", "handshake": "shake-hands-line", "panels-top-left": "layout-line", "flag": "flag-line", "mail": "mail-line", "settings-2": "settings-line", "shield-check": "shield-check-line", "history": "history-line"};
  adminMenus=items.map(([id,title,icon])=>({id,title,icon:icons[icon]||icon,group:groups[id],url:`/admin/?view=${id}`}));
  adminGroups=[...new Set(adminMenus.map(item=>item.group))].map(group=>[group,adminMenus.filter(item=>item.group===group).map(item=>[item.id])]);
}
export function adminSidebar(active) {
  const collapsed = r.adminPreference("collapsed", false);
  const favorites = r.adminPreference("favorites", []),
    recent = r.adminPreference("recent", []);
  const link = (item) =>
    `<div class="admin-menu-item"><a href="${item.url}" ${item.id === active ? 'aria-current="page"' : ""} title="${item.title}">${icon(item.icon)}<span>${item.title}</span></a><button data-favorite="${item.id}" aria-label="${item.title} 즐겨찾기" aria-pressed="${favorites.includes(item.id)}">${icon(favorites.includes(item.id) ? "star-fill" : "star-line")}</button></div>`;
  return `<aside class="admin-sidebar ${collapsed ? "is-collapsed" : ""}"><button class="admin-collapse" aria-label="${collapsed ? '사이드바 펼치기' : '사이드바 접기'}" aria-expanded="${!collapsed}">${icon("side-bar-line")}<span>업무 메뉴</span></button><div class="admin-favorites"><h2>즐겨찾기</h2>${
    adminMenus
      .filter((item) => favorites.includes(item.id))
      .map(link)
      .join("") || "<small>별표로 메뉴를 추가하세요.</small>"
  }</div>${adminGroups.map(([group, items]) => `<details open><summary>${group}</summary><nav>${items.map(([id]) => link(adminMenus.find((item) => item.id === id))).join("")}</nav></details>`).join("")}<div class="admin-recent"><h2>최근 방문</h2>${recent
    .slice(0, 4)
    .map((id) => adminMenus.find((item) => item.id === id))
    .filter(Boolean)
    .map(link)
    .join("")}</div></aside>`;
}
export function bindAdminShell() {
  const side = document.querySelector(".admin-sidebar");
  if (!side) return;
  const shell = document.querySelector(".admin-shell");
  shell.classList.toggle(
    "sidebar-collapsed",
    r.adminPreference("collapsed", false),
  );
  side.querySelector(".admin-collapse").onclick = (event) => {
    const value = !shell.classList.contains("sidebar-collapsed");
    shell.classList.toggle("sidebar-collapsed", value);
    side.classList.toggle("is-collapsed", value);
    side
      .querySelector(".admin-collapse")
      .setAttribute("aria-expanded", String(!value));
    side.querySelector(".admin-collapse").setAttribute("aria-label", value ? "사이드바 펼치기" : "사이드바 접기");
    r.saveAdminPreference("collapsed", value);
  };
  side.querySelectorAll("[data-favorite]").forEach(
    (button) =>
      (button.onclick = () => {
        const id = button.dataset.favorite,
          items = r.adminPreference("favorites", []),
          value = items.includes(id)
            ? items.filter((x) => x !== id)
            : [...items, id];
        r.saveAdminPreference("favorites", value);
        side.querySelectorAll("[data-favorite]").forEach((control) => {
          const selected = value.includes(control.dataset.favorite);
          control.setAttribute("aria-pressed", String(selected));
          control.innerHTML = icon(selected ? "star-fill" : "star-line");
        });
        const favoriteList = side.querySelector(".admin-favorites");
        favoriteList.innerHTML =
          "<h2>즐겨찾기</h2>" +
          adminMenus
            .filter((item) => value.includes(item.id))
            .map(
              (item) =>
                `<div class="admin-menu-item"><a href="${item.url}">${icon(item.icon)}<span>${item.title}</span></a></div>`,
            )
            .join("");
      }),
  );
  const active =
    adminMenus.find(
      (item) => item.url === location.pathname + location.search,
    ) || adminMenus.find((item) => item.id === "dashboard");
  if (active)
    r.saveAdminPreference(
      "recent",
      [
        active.id,
        ...r.adminPreference("recent", []).filter((id) => id !== active.id),
      ].slice(0, 6),
    );
  const search = document.querySelector("#admin-menu-search"),
    results = document.querySelector("#admin-menu-results");
  if(search) search.oninput = () => {
    const query = search.value.trim();
    results.hidden = !query;
    results.innerHTML =
      adminMenus
        .filter((item) => (item.group + item.title).includes(query))
        .map(
          (item) =>
            `<a href="${item.url}">${esc(item.group)} / ${esc(item.title)}</a>`,
        )
        .join("") || "<p>일치하는 메뉴가 없습니다.</p>";
  };
  if(search) search.onkeydown = (event) => {
    if (event.key === "Escape") {
      results.hidden = true;
      search.value = "";
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      results.querySelector("a")?.focus();
    }
  };
}

// Escape closes transient menu panels while native dialogs retain their own focus handling.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document
      .querySelectorAll(".admin-account[open],.admin-column-options[open]")
      .forEach((panel) => {
        panel.open = false;
        panel.querySelector("summary").focus();
      });
  }
});
document.addEventListener("click", (event) => {
  document
    .querySelectorAll(".admin-account[open],.admin-column-options[open]")
    .forEach((panel) => {
      if (!panel.contains(event.target)) panel.open = false;
    });
});
