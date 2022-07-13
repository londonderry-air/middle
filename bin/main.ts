import { generate } from "src/generator";
import { analize } from "src/lexer";
import { parse } from "src/parser";

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts);
  return htmlString;
};

export { gen };
