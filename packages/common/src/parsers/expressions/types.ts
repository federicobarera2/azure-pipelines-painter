export type ExpressionToken = {
  type: TokenType;
  value: string;
};

export type FlowType = "if" | "else" | "elseif" | "each" | "insert";

export type FlowToken = ExpressionToken & {
  value: FlowType;
};

export type TokenType =
  | "property"
  | "comparison_operator"
  | "logical_operator"
  | "flow_operator"
  | "function"
  | "number"
  | "string"
  | "boolean"
  | "left_parenthesis"
  | "right_parenthesis"
  | "comma"
  | "null";

export type ExpressionTokenParserRespose = {
  success: boolean;
  token?: ExpressionToken;
};

export type ExpressionParserFunction = () => ExpressionTokenParserRespose;
