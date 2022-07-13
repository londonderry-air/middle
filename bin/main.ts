import { generate } from "src/generator";
import { analize } from "src/lexer";
import { parse } from "src/parser";
import { CSSClassList } from "src/types";

const gen = (markdown: string, classes?: CSSClassList) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts, classes ?? {});
  return htmlString;
};

console.log(
  gen(
    `# Hello
\`\`\`
console.log(Hello,World!)
\`\`\`
> bq1
> bq2
> bq3
\`\`\`
console.log(Hello,World!)
\`\`\`
`
  )
);

export { gen };
