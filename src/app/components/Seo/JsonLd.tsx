/**
 * Emits schema.org structured data.
 *
 * The payload is our own object, never user input, so serialising it into a
 * script tag is safe — the `<` escape is belt-and-braces against a string that
 * could otherwise close the tag early.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
