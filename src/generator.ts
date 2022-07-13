import { Token, MergedToken } from "./types";

const isAllElmParentRoot = (tokens: Array<Token | MergedToken>) => {
  return tokens.map((t) => t.parent?.elmType).every((val) => val === "root");
};

const getInsertPosition = (content: string) => {
  let state = 0;
  const closeTagParentheses = ["<", ">"];
  let position = 0;
  content.split("").some((c, i) => {
    if (state === 1 && c === closeTagParentheses[state]) {
      position = i;
      return true;
    } else if (state === 0 && c === closeTagParentheses[state]) {
      state++;
    }
  });
  return position + 1;
};

const createMergedContent = (
  currentToken: Token | MergedToken,
  parentToken: Token | MergedToken
) => {
  let content = "";
  switch (parentToken.elmType) {
    case "paragraph":
      content = `<p>${currentToken.content}</p>`;
      break;
    case "h1":
      content = `<h1>${currentToken.content}</h1>`;
      break;
    case "h2":
      content = `<h2>${currentToken.content}</h2>`;
      break;
    case "h3":
      content = `<h3>${currentToken.content}</h3>`;
      break;
    case "h4":
      content = `<h4>${currentToken.content}</h4>`;
      break;
    case "h5":
      content = `<h5>${currentToken.content}</h5>`;
      break;
    case "li":
      content = `<li>${currentToken.content}</li>`;
      break;
    case "ul":
      content = `<ul>${currentToken.content}</ul>`;
      break;
    case "blockquote":
      content = `<blockquote>${currentToken.content}</blockquote>`;
      break;
    case "strong":
      content = `<strong>${currentToken.content}</strong>`;
      break;
    case "code":
      content = `<code>${currentToken.content}</code>`;
      break;
    case "pre":
      content = `<pre>${currentToken.content}</pre>`;
      break;
    case "link":
      // eslint-disable-next-line no-case-declarations
      const href = parentToken.attributes
        ? parentToken.attributes[0].attrValue
        : "";
      content = `<a href="${href}">${currentToken.content}</a>`;
      break;
    case "img":
      // eslint-disable-next-line no-case-declarations
      const src = parentToken.attributes
        ? parentToken.attributes[0].attrValue
        : "";
      content = `<img src="${src}" alt="${currentToken.content}" />`;
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

const generate = (asts: Token[][]) => {
  const htmlStrings = asts.map((lineTokens) => {
    let rearrangedAst: Array<Token | MergedToken> = lineTokens.reverse();

    // 全トークンがトップ（root直下）になるまで、繰り返して行う.
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

          // create MergedToken(階層を１つ挙げる)
          const mergedToken: MergedToken = {
            id: parentToken.id,
            elmType: "merged",
            content: createMergedContent(currentToken, parentToken),
            parent: parentToken.parent,
          };

          // 階層を上げたので、元の ParentToken を MergedToken に置き換える
          rearrangedAst.splice(parentIndex, 1, mergedToken);
        }
      }
    }
    return _generateHtmlString(rearrangedAst);
  });
  return htmlStrings.join("");
};

export { generate };
