const REPO_URL = 'https://github.com/faergeek/js-webapp-template';

export function App() {
  return (
    <>
      <h1>JS WebApp Template</h1>

      <p>
        A template to build web applications with bundling for both Node.js and
        browsers
      </p>

      <p>
        <a href={`${REPO_URL}/generate`}>Use it</a>
      </p>

      <p>
        <a href={REPO_URL}>Sources</a>
      </p>
    </>
  );
}
