export async function runDemo(demoName) {
  const { run } = await import(`./${demoName}/index.js`);

  return run();
}
