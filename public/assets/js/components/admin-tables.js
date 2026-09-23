
import * as r from "./admin-table-data.js";
import { esc, icon, toast } from "./admin-renderers.js";
import { queryRecords, RecordSelection, kstDay } from "./admin-query.js";
export function csvCell(value) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') +
    '"'
  );
}
export function commonStatuses(rows) {
  return rows.length
    ? r
        .allowedAdminStatuses(rows[0])
        .filter((s) =>
          rows.every((row) => r.allowedAdminStatuses(row).includes(s)),
        )
    : [];
}
const statusLabel = (value) =>
  ({ published: "게시", draft: "초안", true: "모집중", false: "모집마감" })[
    value
  ] || value;
const sortFields = {
  회원명: "name",
  "신청자 / 단체":"name",
  기업명: "name",
  "소속 직장": "organizationNameSnapshot",
  회원번호: "number",
  "활동 지역": "region",
  등록일: "createdAt",
  접수일: "createdAt",
  "개최일 / 장소": "startsAt",
  정원: "capacity",
  "회원 수": "memberCount",
  게시판: "category",
  상태: "status",
  "게시 상태": "status",
  "승인 상태": "status",
  "활동 상태": "status",
  "모집 상태": "recruiting",
  "노출 순서": "order",
};
export function enhanceAdminTables() {
  document
    .querySelectorAll(".admin-main .data-table-wrap")
    .forEach((wrap, index) => {
      const table = wrap.querySelector("table"),
        head = table.tHead.rows[0],
        body = table.tBodies[0],
        nativeRecipient = head.cells[0]?.textContent.trim() === "선택";
      const entries = [...body.rows]
        .filter((row) => !row.querySelector("[colspan]"))
        .map((row, i) => {
          const edit = row.querySelector("[data-edit]"),
            key = row.dataset.recordKey || edit?.dataset.key;
          const id =
            row.dataset.recordId ||
            edit?.dataset.edit ||
            row.querySelector("[name=recipient]")?.value ||
            String(i);
          const source =
            key === "requests"
              ? [...r.state().applications, ...r.state().registrations]
              : key
                ? r.collection(key, { includeDeleted: true })
                : [];
          const record = source.find((x) => x.id === id) || r.recordAt(i) || {
            id,
            title: row.cells[nativeRecipient ? 1 : 0].textContent,
            summary: row.textContent,
          };
          if(key==="requests")record.name=r.collection("members").find(member=>member.id===record.memberId)?.name||record.title;
          return { row, key, id:record.id, record };
        });
      const selection = new RecordSelection(),
        prefix = index ? "t" + index + "_" : "",
        url = new URL(location.href),
        get = (name, other = "") =>
          url.searchParams.get(prefix + name) || other;
      let state = {
        query: get("q"),
        status: get("listStatus"),
        from: get("from"),
        to: get("to"),
        sort: get("sort", "title"),
        direction: get("direction", "asc"),
        page: Number(get("page", "1")),
        size: Number(get("size", "20")),
        ...Object.fromEntries(
          [
            "searchField",
            "dateField",
            "sport",
            "region",
            "category",
            "eventId",
            "cohort",
            "associationId",
          ].map((key) => [key, get(key)]),
        ),
      };
      state.dateField ||= entries.some((e) => e.record.createdAt)
        ? "createdAt"
        : "startsAt";
      const saved = r.adminPreference(
          "table:" + location.pathname + ":" + (url.searchParams.get("view") || "dashboard") + ":" + index,
          {},
        ),
        hidden = new Set(saved.hidden || []);
      let result;
      wrap.classList.add("admin-table-scroll");
      wrap.tabIndex = 0;
      wrap.setAttribute("aria-label", "관리 목록 · 가로 스크롤 가능");
      const card = document.createElement("section");
      card.className = "admin-data-card";
      wrap.before(card);
      card.append(wrap);
      const statuses = [
        ...new Set(
          entries
            .map((e) => String(e.record.status ?? e.record.recruiting ?? ""))
            .filter(Boolean),
        ),
      ];
      const tabs = document.createElement("nav");
      tabs.className = "admin-status-tabs";
      tabs.setAttribute("aria-label", "목록 상태");
      tabs.innerHTML = ["", ...statuses]
        .map(
          (s) =>
            `<button type="button" data-tab="${esc(s)}">${esc(s ? statusLabel(s) : "전체")} <span>${s ? entries.filter((e) => String(e.record.status ?? e.record.recruiting) === s).length : entries.length}</span></button>`,
        )
        .join("");
      card.prepend(tabs);
      const search = document.createElement("form");
      search.className = "admin-list-search";
      search.innerHTML = `<label>검색어<input name="q" value="${esc(state.query)}" placeholder="명칭·내용 검색"></label><label>시작일<input type="date" name="from" value="${esc(state.from)}"></label><label>종료일<input type="date" name="to" value="${esc(state.to)}"></label><div class="admin-presets">${[0, 7, 30, 90].map((n) => `<button type="button" data-days="${n}">${n ? n + "일" : "오늘"}</button>`).join("")}</div><button type="button" data-all-dates>전체 기간</button><button class="button" type="submit">조회</button><button type="button" data-reset class="button secondary">초기화</button>`;
      tabs.after(search);
      const advanced = document.createElement("details");
      advanced.className = "admin-advanced-search";
      advanced.innerHTML = "<summary>상세 조건</summary><div></div>";
      search.prepend(advanced);
      const fields = advanced.querySelector("div");
      const options = {
        searchField: [
          ["", "전체"],
          ["title", "제목"],
          ["name", "이름"],
          ["summary", "소개"],
          ["bodyText", "본문"],
        ],
        dateField: [
          ["createdAt", "등록일"],
          ["startsAt", "시작일"],
          ["registrationEndsAt", "접수 마감일"],
        ],
      };
      for (const key of [
        "sport",
        "region",
        "category",
        "eventId",
        "cohort",
        "associationId",
      ]) {
        const values = [
          ...new Set(entries.map((e) => e.record[key]).filter(Boolean)),
        ];
        if (values.length)
          options[key] = [
            ["", "전체"],
            ...values.map((value) => {
              const source =
                key === "eventId"
                  ? r.collection("events")
                  : key === "associationId"
                    ? r.content("associations")
                    : [];
              const match = source.find((x) => x.id === value);
              return [value, match?.title || match?.name || value];
            }),
          ];
      }
      const labels = {
        searchField: "검색 대상",
        dateField: "날짜 기준",
        sport: "종목",
        region: "지역",
        category: "분류",
        eventId: "대회",
        cohort: "기수",
        associationId: "종목협회",
      };
      fields.innerHTML = Object.entries(options)
        .map(
          ([key, values]) =>
            `<label>${labels[key]}<select name="${key}">${values.map(([value, label]) => `<option value="${esc(value)}" ${state[key] === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></label>`,
        )
        .join("");
      search.querySelector("[data-all-dates]").onclick = () => {
        search.elements.from.value = "";
        search.elements.to.value = "";
      };
      const chips = document.createElement("div");
      chips.className = "admin-filter-chips";
      search.after(chips);
      const tools = document.createElement("div");
      tools.className = "admin-table-tools";
      tools.innerHTML = `<strong data-result></strong><div><label>행 수 <select data-size>${[20, 50, 100].map((n) => `<option value="${n}">${n}개</option>`).join("")}</select></label><label>밀도 <select data-density><option value="normal">기본</option><option value="compact">좁게</option></select></label><details class="admin-column-options"><summary>열 설정</summary><div></div></details><button type="button" data-default-columns>설정 복원</button></div>`;
      wrap.before(tools);
      const bar = document.createElement("div");
      bar.className = "admin-bulk-bar";
      bar.innerHTML = `<span role="status" data-count>0개 선택</span><div><button type="button" data-select-results>검색 결과 전체 선택</button><button type="button" data-clear>선택 해제</button><button class="button secondary small" data-export>선택 CSV</button><button class="button small" data-bulk>일괄 변경</button></div>`;
      wrap.before(bar);
      const footer = document.createElement("div");
      footer.className = "admin-table-footer";
      card.append(footer);
      const th = nativeRecipient ? head.cells[0] : document.createElement("th");
      if (!nativeRecipient) head.prepend(th);
      th.className = "admin-check-cell";
      th.innerHTML =
        '<input type="checkbox" aria-label="현재 페이지 전체 선택">';
      const all = th.querySelector("input");
      for (const entry of entries) {
        let check = entry.row.querySelector("[name=recipient]");
        if (!check) {
          const cell = document.createElement("td");
          cell.className = "admin-check-cell";
          cell.innerHTML = `<input type="checkbox" aria-label="${esc(entry.record.title || entry.record.name || entry.id)} 선택">`;
          entry.row.prepend(cell);
          check = cell.querySelector("input");
        }
        entry.check = check;
        check.onchange = () => {
          selection.toggle(entry.id, check.checked);
          updateSelection();
        };
      }
      card.addEventListener("click", (event) => {
        const link = event.target.closest("a.admin-record-title");
        if (link) {
          const target = new URL(link.href);
          target.searchParams.set(
            "return",
            location.pathname + location.search,
          );
          link.href = target;
        }
      });
      function sync() {
        for (const [name, value] of Object.entries({
          q: state.query,
          listStatus: state.status,
          from: state.from,
          to: state.to,
          sort: state.sort,
          direction: state.direction,
          page: state.page,
          size: state.size,
          ...Object.fromEntries(
            [
              "searchField",
              "dateField",
              "sport",
              "region",
              "category",
              "eventId",
              "cohort",
              "associationId",
            ].map((k) => [k, state[k]]),
          ),
        })) {
          value
            ? url.searchParams.set(prefix + name, String(value))
            : url.searchParams.delete(prefix + name);
        }
        history.replaceState(null, "", url);
      }
      function updateSelection() {
        const flags = selection.state(result.visible);
        all.checked = flags.checked;
        all.indeterminate = flags.indeterminate;
        all.disabled = !result.visible.length;
        all.setAttribute(
          "aria-checked",
          flags.indeterminate ? "mixed" : String(flags.checked),
        );
        entries.forEach((e) => {
          e.check.checked = selection.ids.has(e.id);
          e.row.classList.toggle("is-selected", e.check.checked);
        });
        bar.querySelector("[data-count]").textContent =
          `${selection.ids.size}개 선택 / ${result.total}개 결과`;
        bar
          .querySelectorAll("[data-clear],[data-export],[data-bulk]")
          .forEach((b) => (b.disabled = !selection.ids.size));
        bar.classList.toggle("has-selection", !!selection.ids.size);
        card.dispatchEvent(
          new CustomEvent("admin-selection-change", {
            bubbles: true,
            detail: { ids: [...selection.ids], recipients: nativeRecipient },
          }),
        );
      }
      function render() {
        result = queryRecords(
          entries.map((e) => e.record),
          state,
        );
        state.page = result.page;
        state.size = result.size;
        body.replaceChildren(
          ...result.visible.map(
            (record) => entries.find((e) => e.id === record.id).row,
          ),
        );
        if (!result.total)
          body.innerHTML = `<tr><td colspan="${head.cells.length}"><div class="empty">검색 결과가 없습니다.</div></td></tr>`;
        tools.querySelector("[data-result]").textContent =
          `검색 결과 ${result.total}건`;
        tabs
          .querySelectorAll("button")
          .forEach((b) =>
            b.setAttribute(
              "aria-current",
              String(b.dataset.tab === state.status),
            ),
          );
        footer.innerHTML = `<span>${result.page} / ${result.pages} 페이지</span><button type="button" data-prev ${result.page === 1 ? "disabled" : ""}>이전</button><label>페이지 <input type="number" min="1" max="${result.pages}" value="${result.page}" aria-label="페이지 이동"></label><button type="button" data-next ${result.page === result.pages ? "disabled" : ""}>다음</button>`;
        footer.querySelector("[data-prev]").onclick = () => {
          state.page--;
          render();
          sync();
        };
        footer.querySelector("[data-next]").onclick = () => {
          state.page++;
          render();
          sync();
        };
        footer.querySelector("input").onchange = (e) => {
          state.page = Number(e.target.value);
          render();
          sync();
        };
        chips.innerHTML = [
          ["query", "검색: " + state.query],
          ["from", "시작: " + state.from],
          ["to", "종료: " + state.to],
          ["status", "상태: " + statusLabel(state.status)],
          ...Object.keys(options)
            .filter((k) => !["searchField", "dateField"].includes(k))
            .map((k) => [k, labels[k] + ": " + state[k]]),
        ]
          .filter(([k]) => state[k])
          .map(
            ([k, label]) =>
              `<button type="button" data-remove="${k}">${esc(label)} ×</button>`,
          )
          .join("");
        chips.querySelectorAll("button").forEach(
          (b) =>
            (b.onclick = () => {
              state[b.dataset.remove] = "";
              search.elements.q.value = state.query;
              search.elements.from.value = state.from;
              search.elements.to.value = state.to;
              if (search.elements[b.dataset.remove])
                search.elements[b.dataset.remove].value = "";
              selection.clear();
              render();
              sync();
            }),
        );
        applyColumns();
        updateSelection();
      }
      function applyColumns() {
        [...head.cells].forEach((cell, i) => {
          cell.hidden = hidden.has(i);
          entries.forEach((e) => (e.row.cells[i].hidden = hidden.has(i)));
        });
      }
      [...head.cells].slice(1).forEach((cell, offset) => {
        const i = offset + 1,
          label = cell.textContent.trim();
        if (["작업", "처리", "안내", "선택"].includes(label)) return;
        const field = sortFields[label] || (offset === 0 ? "title" : null);
        if (!field) return;
        cell.setAttribute(
          "aria-sort",
          state.sort === field
            ? state.direction === "asc"
              ? "ascending"
              : "descending"
            : "none",
        );
        cell.innerHTML = `<button class="admin-sort" type="button">${esc(label)} ${icon("arrow-up-down-line")}</button>`;
        cell.querySelector("button").onclick = () => {
          state.direction =
            state.sort === field && state.direction === "asc" ? "desc" : "asc";
          state.sort = field;
          [...head.cells].forEach((c) => c.removeAttribute("aria-sort"));
          cell.setAttribute(
            "aria-sort",
            state.direction === "asc" ? "ascending" : "descending",
          );
          render();
          sync();
        };
        const option = document.createElement("label");
        option.innerHTML = `<input type="checkbox" ${hidden.has(i) ? "" : "checked"}>${esc(label)}`;
        option.querySelector("input").onchange = (e) => {
          e.target.checked ? hidden.delete(i) : hidden.add(i);
          r.saveAdminPreference("table:" + location.pathname + ":" + (url.searchParams.get("view") || "dashboard") + ":" + index, {
            hidden: [...hidden],
            density: tools.querySelector("[data-density]").value,
          });
          applyColumns();
        };
        tools.querySelector(".admin-column-options div").append(option);
      });
      tools.querySelector("[data-default-columns]").onclick = () => {
        hidden.clear();
        tools
          .querySelectorAll(".admin-column-options input")
          .forEach((input) => (input.checked = true));
        tools.querySelector("[data-density]").value = "normal";
        card.classList.remove("is-compact");
        r.saveAdminPreference("table:" + location.pathname + ":" + (url.searchParams.get("view") || "dashboard") + ":" + index, {});
        applyColumns();
      };
      tools.querySelector("[data-size]").value = state.size;
      tools.querySelector("[data-size]").onchange = (e) => {
        state.size = Number(e.target.value);
        state.page = 1;
        render();
        sync();
      };
      tools.querySelector("[data-density]").value = saved.density || "normal";
      card.classList.toggle("is-compact", saved.density === "compact");
      tools.querySelector("[data-density]").onchange = (e) => {
        card.classList.toggle("is-compact", e.target.value === "compact");
        r.saveAdminPreference("table:" + location.pathname + ":" + (url.searchParams.get("view") || "dashboard") + ":" + index, {
          hidden: [...hidden],
          density: e.target.value,
        });
      };
      search.onsubmit = (e) => {
        e.preventDefault();
        if (
          search.elements.from.value > search.elements.to.value &&
          search.elements.to.value
        ) {
          search.elements.to.setCustomValidity(
            "종료일은 시작일 이후여야 합니다.",
          );
          search.elements.to.reportValidity();
          return;
        }
        search.elements.to.setCustomValidity("");
        state = {
          ...state,
          ...Object.fromEntries(new FormData(search)),
          query: search.elements.q.value,
          from: search.elements.from.value,
          to: search.elements.to.value,
          page: 1,
        };
        selection.clear();
        render();
        sync();
      };
      search.elements.to.oninput = () =>
        search.elements.to.setCustomValidity("");
      search.querySelector("[data-reset]").onclick = () => {
        state = {
          ...state,
          query: "",
          from: "",
          to: "",
          status: "",
          page: 1,
          ...Object.fromEntries(Object.keys(options).map((k) => [k, ""])),
        };
        search.reset();
        search.elements.q.value = "";
        search.elements.from.value = "";
        search.elements.to.value = "";
        selection.clear();
        render();
        sync();
      };
      search.querySelectorAll("[data-days]").forEach(
        (b) =>
          (b.onclick = () => {
            const now = new Date();
            search.elements.to.value = kstDay(now);
            search.elements.from.value = kstDay(
              new Date(+now - Number(b.dataset.days) * 86400000),
            );
          }),
      );
      tabs.querySelectorAll("button").forEach(
        (b) =>
          (b.onclick = () => {
            state.status = b.dataset.tab;
            state.page = 1;
            selection.clear();
            render();
            sync();
          }),
      );
      all.onchange = () => {
        result.visible.forEach((e) => selection.toggle(e.id, all.checked));
        updateSelection();
        entries.forEach((e) =>
          e.check.dispatchEvent(new Event("change", { bubbles: true })),
        );
      };
      bar.querySelector("[data-select-results]").onclick = () => {
        selection.select(result.rows);
        updateSelection();
      };
      bar.querySelector("[data-clear]").onclick = () => {
        selection.clear();
        updateSelection();
      };
      bar.querySelector("[data-export]").onclick = () => {
        const selected = entries.filter((e) => selection.ids.has(e.id));
        const columns = [...head.cells]
          .map((c, i) => ({ i, title: c.textContent.trim() }))
          .filter((c) => c.i && !["작업", "처리", "안내"].includes(c.title));
        const csv = [
          columns.map((c) => c.title),
          ...selected.map((e) =>
            columns.map((c) => e.row.cells[c.i].textContent.trim()),
          ),
        ]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n");
        const objectURL = URL.createObjectURL(
          new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
        );
        const a = document.createElement("a");
        a.href = objectURL;
        a.download = "queen-selected.csv";
        a.click();
        setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
        toast(`${selected.length}건 내보내기 완료`);
      };
      bar.querySelector('[data-bulk]').remove();
      render();
    });
}
