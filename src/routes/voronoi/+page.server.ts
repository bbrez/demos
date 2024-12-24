import * as fs from "fs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  const code = fs.readFileSync("./src/routes/voronoi/voronoi.js").toString();

  return {
    code
  }
}
