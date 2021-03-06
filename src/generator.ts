import { CODE_TYPE_REGXP } from "./regex";
import { Token, MergedToken, CSSClassList } from "./types";
import hljs from "highlight.js";

const isAllElmParentRoot = (tokens: Array<Token | MergedToken>) => {
  return tokens.map((t) => t.parent?.elmType).every((val) => val === "root");
};

const getInsertPosition = (content: string) => {
  const closeTagParentheses = ["<", ">"];
  let position = 0;
  let searchPos = 0;
  let state = 0;
  const chars = content.split("");
  while (state < 2) {
    if (state === 1 && chars[searchPos] === closeTagParentheses[state]) {
      position = searchPos;
      state++;
    } else if (state === 0 && chars[searchPos] === closeTagParentheses[state]) {
      state++;
    }
    searchPos++;
  }
  content.split("").forEach((c, i) => {
    if (state === 1 && c === closeTagParentheses[state]) {
      position = i;
    } else if (state === 0 && c === closeTagParentheses[state]) {
      state++;
    }
  });
  return position + 1;
};

const createMergedContent = (
  currentToken: Token | MergedToken,
  parentToken: Token | MergedToken,
  cssList: CSSClassList
) => {
  let content = "";
  switch (parentToken.elmType) {
    case "paragraph":
      content = `<p${cssList.p ? ` class="${cssList.p}"` : ""}>${
        currentToken.content
      }</p>`;
      break;
    case "h1":
      content = `<h1${cssList.h1 ? ` class="${cssList.h1}"` : ""}>${
        currentToken.content
      }</h1>`;
      break;
    case "h2":
      content = `<h2${cssList.h2 ? ` class="${cssList.h2}"` : ""}>${
        currentToken.content
      }</h2>`;
      break;
    case "h3":
      content = `<h3${cssList.h3 ? ` class="${cssList.h3}"` : ""}>${
        currentToken.content
      }</h3>`;
      break;
    case "h4":
      content = `<h4${cssList.h4 ? ` class="${cssList.h4}"` : ""}>${
        currentToken.content
      }</h4>`;
      break;
    case "h5":
      content = `<h5${cssList.h1 ? ` class="${cssList.h1}"` : ""}>${
        currentToken.content
      }</h5>`;
      break;
    case "li":
      content = `<li${cssList.li ? ` class="${cssList.li}"` : ""}>${
        currentToken.content
      }</li>`;
      break;
    case "ul":
      content = `<ul${cssList.ul ? ` class="${cssList.ul}"` : ""}>${
        currentToken.content
      }</ul>`;
      break;
    case "blockquote":
      content = `<blockquote${
        cssList.blockquote ? ` class="${cssList.blockquote}"` : ""
      }>${currentToken.content}</blockquote>`;
      break;
    case "strong":
      content = `<strong${cssList.strong ? ` class="${cssList.strong}"` : ""}>${
        currentToken.content
      }</strong>`;
      break;
    case "code":
      console.log(currentToken.content);
      // eslint-disable-next-line no-case-declarations
      const codeType = currentToken.content.match(CODE_TYPE_REGXP);
      content = `<code class="hljs">${
        codeType
          ? hljs.highlight(currentToken.content.replace(codeType[0], ""), {
              language: codeType[1],
            }).value
          : currentToken.content
      }</code>`;
      content.replace("\n", "<br>");
      if (typeof window === "undefined" && codeType) {
        const link = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/${cssList.code}.min.css">`;
        content = link + content;
      }
      if (typeof window !== "undefined" && codeType) {
        const head = document.getElementsByTagName("head")[0];
        const link = document.createElement("link");
        link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/${cssList.code}.min.css`;
        link.rel = "stylesheet";
        head.appendChild(link);
      }
      break;
    case "pre":
      content = `<pre${cssList.pre ? ` class="${cssList.pre}"` : ""}>${
        currentToken.content
      }</pre>`;
      break;
    case "link":
      // eslint-disable-next-line no-case-declarations
      const href = parentToken.attributes
        ? parentToken.attributes[0].attrValue
        : "";
      content = `<a href="${href}"${cssList.a ? ` class="${cssList.a}"` : ""}>${
        currentToken.content
      }</a>`;
      break;
    case "img":
      // eslint-disable-next-line no-case-declarations
      const src = parentToken.attributes
        ? parentToken.attributes[0].attrValue
        : "";
      content = `<img src="${src}" alt="${currentToken.content}"${
        cssList.img ? ` class="${cssList.img}"` : ""
      }>`;
      break;
    case "merged":
      // eslint-disable-next-line no-case-declarations
      const position = getInsertPosition(parentToken.content);
      content = `${parentToken.content.slice(0, position)}${
        currentToken.content
      }${parentToken.content.slice(position)}`;
  }
  return content;
};

const _generateHtmlString = (tokens: Array<Token | MergedToken>) => {
  return tokens
    .map((t) => t.content)
    .reverse()
    .join("");
};

const generate = (asts: Token[][], cssList: CSSClassList) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token | MergedToken> = lineTokens.reverse();

    // ??????????????????????????????root????????????????????????????????????????????????.
    while (!isAllElmParentRoot(rearrangedAst)) {
      let index = 0;
      while (index < rearrangedAst.length) {
        if (rearrangedAst[index].parent?.elmType === "root") {
          // move to next line
          index++;
        } else {
          const currentToken = rearrangedAst[index];

          // Remove current token
          rearrangedAst = rearrangedAst.filter((_, t) => t !== index);

          // get current token's parent
          const parentIndex = rearrangedAst.findIndex(
            (t) => t.id === currentToken.parent.id
          );
          const parentToken = rearrangedAst[parentIndex];

          // create MergedToken(????????????????????????)
          const mergedToken: MergedToken = {
            id: parentToken.id,
            elmType: "merged",
            content: createMergedContent(currentToken, parentToken, cssList),
            parent: parentToken.parent,
          };

          // ????????????????????????????????? ParentToken ??? MergedToken ??????????????????
          rearrangedAst.splice(parentIndex, 1, mergedToken);
        }
      }
    }
    return _generateHtmlString(rearrangedAst);
  });
  return htmlStrings.join("");
};

export { generate };
