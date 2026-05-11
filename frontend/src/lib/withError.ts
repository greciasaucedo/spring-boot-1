export async function withError(
  action: () => Promise<unknown>,
  setError: (msg: string) => void,
): Promise<void> {
  try {
    await action();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error desconocido");
  }
}
