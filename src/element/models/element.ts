export type ElementType = 'root'
    | 'text'
    | 'strong'
    | 'ul'
    | 'li'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'itaric'
    | 'si'
    | 'list'
    | 'img'
    | 'ol'
    | 'link'
    | 'code'
    | 'paragraph'
    | 'break'
    | 'pre'

export type Attribute = {
    attrName: string
    attrValue: string
}

export type AnalysisState = 'neutral'
    | 'list'
    | 'pre'