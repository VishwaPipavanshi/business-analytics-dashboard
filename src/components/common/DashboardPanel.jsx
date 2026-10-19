export default function DashboardPanel({
  id,
  title,
  children,
  onExpand,
  expanded = false,
  closing = false,
  className = "",
}) {
  const handleKeyDown = (event) => {
    if (!expanded && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onExpand?.({ id, title });
    }
    if (expanded && event.key === "Escape") {
      event.stopPropagation();
      onExpand?.(null);
    }
  };

  return (
    <article
      className={`card dashboard-panel ${className}${expanded ? " dashboard-panel--expanded" : ""}${closing ? " dashboard-panel--closing" : ""}`}
      role={expanded ? "dialog" : "button"}
      aria-label={expanded ? title : `Expand ${title}`}
      aria-modal={expanded ? "true" : undefined}
      aria-expanded={expanded}
      tabIndex={expanded ? -1 : 0}
      onClick={(event) => {
        if (expanded) return;
        if (event.target.closest("button, a, input, select, textarea")) return;
        onExpand?.({ id, title });
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </article>
  );
}
