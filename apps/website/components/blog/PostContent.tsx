export function PostContent({ html }: { html: string }) {
  return <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
