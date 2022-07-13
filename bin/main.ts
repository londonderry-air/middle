import { generate } from "src/generator";
import { analize } from "src/lexer";
import { parse } from "src/parser";

const gen = (markdown: string) => {
  const mdArray = analize(markdown);
  const asts = mdArray.map((md) => parse(md));
  const htmlString = generate(asts);
  return htmlString;
};

console.log(
  gen(`
Nextjsで作成している個人プロジェクトにframer-motionでページ間遷移しようとしたけど、exitが機能しない。。
何が悪かったのかわかったので、その備忘録。
  
### 症状は？
  
> export const Layout = (props: { children: React.ReactNode }) => {
>  return (
`)
);

export { gen };
