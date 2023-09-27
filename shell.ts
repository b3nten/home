export default function createShell({
  title = "Deno App",
  bundle = "",
  styles = "",
}) {
  return `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style id="_global_styles">${styles}</style>
  </head>
  <body>
    <script type="module">${bundle}</script>
    <nav-component></nav-component>
    <home-route></home-route>
    <posts-route></posts-route>
    <post-route></post-route>
    <blog-cache>
    ${
    JSON.stringify({
      "post1": "Hello from post 1",
      "post2": "Hello from post 2",
    })
  }
  </blog-cache>
  </body>
</html>`;
}
