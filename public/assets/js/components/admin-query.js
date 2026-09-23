export function kstDay(value) {
  const time = new Date(value);
  return Number.isNaN(+time)
    ? ""
    : new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(time);
}
export function queryRecords(
  records,
  {
    query = "",
    status = "",
    from = "",
    to = "",
    sort = "title",
    direction = "asc",
    page = 1,
    size = 20,
    searchField = "",
    dateField = "createdAt",
    sport = "",
    region = "",
    category = "",
    eventId = "",
    cohort = "",
    associationId = "",
  } = {},
) {
  const q = query.trim().toLocaleLowerCase(),
    limit = [20, 50, 100].includes(Number(size)) ? Number(size) : 20;
  const rows = records
    .filter((record) => {
      const searchRecord = {
        ...record,
        bodyText:
          record.bodyText ||
          (Array.isArray(record.body)
            ? record.body.join("\n")
            : record.body || ""),
      };
      const searchable = Object.entries(searchRecord)
        .filter(([key]) => !searchField || key === searchField)
        .filter(
          ([key]) => !["bodyJson", "bodyHtml", "originalBody"].includes(key),
        )
        .map(([, v]) => (typeof v === "object" ? "" : String(v ?? "")))
        .join(" ")
        .toLocaleLowerCase();
      const day = kstDay(record[dateField || "createdAt"]);
      return (
        Object.entries({
          sport,
          region,
          category,
          eventId,
          cohort,
          associationId,
        }).every(([key, value]) => !value || String(record[key]) === value) &&
        (!q || searchable.includes(q)) &&
        (!status ||
          String(record.status ?? record.recruiting ?? "") === status) &&
        (!from || day >= from) &&
        (!to || (!!day && day <= to))
      );
    })
    .sort((a, b) => {
      const rawA = a[sort] ?? a.title ?? a.name ?? "",
        rawB = b[sort] ?? b.title ?? b.name ?? "";
      const av = sort.endsWith("At") ? Date.parse(rawA) || 0 : rawA,
        bv = sort.endsWith("At") ? Date.parse(rawB) || 0 : rawB;
      return (
        (direction === "desc" ? -1 : 1) *
          (typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), "ko", { numeric: true })) ||
        String(a.id).localeCompare(String(b.id))
      );
    });
  const pages = Math.max(1, Math.ceil(rows.length / limit)),
    current = Math.min(pages, Math.max(1, Number(page) || 1));
  return {
    rows,
    visible: rows.slice((current - 1) * limit, current * limit),
    total: rows.length,
    pages,
    page: current,
    size: limit,
  };
}
export class RecordSelection {
  constructor() {
    this.ids = new Set();
  }
  toggle(id, value) {
    value ? this.ids.add(id) : this.ids.delete(id);
  }
  select(rows) {
    rows.forEach((row) => this.ids.add(row.id));
  }
  clear() {
    this.ids.clear();
  }
  state(rows) {
    const count = rows.filter((row) => this.ids.has(row.id)).length;
    return {
      checked: !!rows.length && count === rows.length,
      indeterminate: count > 0 && count < rows.length,
    };
  }
}
