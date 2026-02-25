function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedCell({ value, search }: { value: string; search: string }) {
  if (!search) return <>{value}</>;

  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = value.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={i} style={{ backgroundColor: "#fff59d", fontWeight: 500 }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default HighlightedCell;

export function highlightHTMLText(html: string, search: string): string {
  if (!search) return html;

  const div = document.createElement("div");
  div.innerHTML = html;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
      if (regex.test(text)) {
        const span = document.createElement("span");
        span.innerHTML = text.replace(regex, `<mark style="background-color: #fff59d">$1</mark>`);
        (node as ChildNode).replaceWith(...Array.from(span.childNodes));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(div);
  return div.innerHTML;
}
