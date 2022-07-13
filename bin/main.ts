import { generate } from "src/generator";
import { analize } from "src/lexer";
import { parse } from "src/parser";
import { CSSClassList } from "src/types";

const gen = (markdown: string, classes?: CSSClassList) => {
  const mdArray = analize(markdown);
  console.log(mdArray);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts, classes ?? {});
  return htmlString;
};

export { gen };
