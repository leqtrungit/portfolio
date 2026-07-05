export function PostContent({ html }: { html: string }) {
  return (
    <article
      className="post-body"
      style={{ padding: "44px 0 40px" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
