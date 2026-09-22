import meta from "./seed-meta.json";
import prog from "./seed-prog.json";

export const report = { ...meta, ...prog } as typeof meta & typeof prog;
