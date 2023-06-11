import { IVisitable } from "../common/visitor";
import { ExpressionLexer } from "./lexer";
import {
  AndNode,
  ComparisonNode,
  FlowNode,
  FunctionNode,
  ValueNode,
  OrNode,
  PropertyNode,
  FlowTokenNode,
} from "./nodes";
import { ExpressionToken, FlowToken, TokenType } from "./types";

export class ExpressionParser {
  private _tokens: ExpressionToken[];
  private _currentTokenIndex: number = 0;

  constructor(raw_expression: string) {
    this._tokens = new ExpressionLexer(raw_expression).tokenize();
  }

  parse(): IVisitable | null {
    if (this._tokens.length > 0) return this.expression();
    return null;
  }

  private parse_function(primary_argument: IVisitable | null = null) {
    const token = this.pop_expected("function");
    const function_node = new FunctionNode(token.value);

    if (primary_argument != null)
      function_node.arguments.push(primary_argument);

    let wrapped = false;
    if (this.is("left_parenthesis")) {
      this.pop_expected("left_parenthesis");
      wrapped = true;
    }

    function_node.arguments.push(this.primary_expression());

    while (this.is("comma")) {
      this.pop_expected("comma");
      function_node.arguments.push(this.primary_expression());
    }

    if (wrapped) this.pop_expected("right_parenthesis");

    return function_node;
  }

  private expression(): IVisitable {
    return this.primary_expression();
  }

  private primary_expression() {
    if (this.is("left_parenthesis")) return this.parse_nested();
    if (this.is("flow_operator")) return this.parse_flow();
    if (this.is("function")) return this.parse_function();
    if (this.is("property")) return this.parse_property();
    if (this.is("boolean")) return this.value("boolean", (v) => Boolean(v));
    if (this.is("number")) return this.value("number", (v) => Number(v));
    if (this.is("string")) return this.value("string", (v) => v);
    if (this.is("null")) return this.value("null", () => null);
    throw "Expected primaryExpression";
  }

  private value(type: TokenType, f: (v: string) => any) {
    const token = this.pop_expected(type);
    return new ValueNode(f(token.value));
  }

  private parse_flow() {
    const token = this.pop_flow();

    if (token.value === "if" || token.value === "elseif") {
      return new FlowTokenNode(token.value, token.value, this.expression());
    } else if (token.value === "insert"  || token.value === "else") {
      return new FlowTokenNode(token.value, token.value);
    }
    else if (token.value === "each") {
      // [each] [property] [in] [expression]
      const id = this.pop_expected("property");
      this.pop_expected("function", "in");
      
      return new FlowTokenNode("each", id.value, this.expression());
    }

    throw "Unexpected flow operator";
  }

  /**
   * This parses the language for a full flow statement
   * Devops doesn't have a full flow statement, so we need to parse it as a token
   */
  private parse_real_flow() {
    const token = this.pop_flow();

    if (token.value === "if" || token.value === "elseif") {
      const condition = this.expression();
      const if_true = this.expression();
      const if_false =
        this.is("flow_operator", "else") || this.is("flow_operator", "elseif")
          ? this.expression()
          : new ValueNode(null);

      return new FlowNode(condition, if_true, if_false);
    } else if (token.value === "else") {
      return this.expression();
    }

    throw "Expected flow operator";
  }

  private parse_property() {
    var filterToken = this.pop_expected("property");
    return new PropertyNode(filterToken.value);
  }

  private parse_nested() {
    this.pop_expected("left_parenthesis");
    const filterNode = this.expression();
    this.pop_expected("right_parenthesis");
    return filterNode;
  }

  private is(type: TokenType, value: any = null) {
    const token = this.peek();

    if (!token) return false;

    return token.type === type && !value ? true : token.value === value;
  }

  private peek(): ExpressionToken | null {
    if (this._currentTokenIndex < this._tokens.length)
      return this._tokens[this._currentTokenIndex];

    return null;
  }

  private pop_expected(tokenType: TokenType, value: any = null): ExpressionToken {
    if (!this.is(tokenType, value)) 
      throw `Expected ${tokenType}`;

    const token = this.peek()!;
    ++this._currentTokenIndex;

    return token;
  }

  private pop_flow(): FlowToken {
    const token = this.pop_expected("flow_operator");
    return token as FlowToken;
  }

  /*
    Might not be needed as logical operators are functions in devops language...
    Keeping it for now in case we need to change it back
  */
  private or(): IVisitable {
    var first_argument = this.and();

    if (this.is("logical_operator", "or")) return this.parse_or(first_argument);
    if (
      !this.is("logical_operator", "and") ||
      !this.is("logical_operator", "if")
    )
      return first_argument;

    this.pop_expected("logical_operator");

    return new AndNode(first_argument, this.or());
  }

  private and() {
    const firstArgument = this.comparison();
    if (this.is("logical_operator", "and"))
      return this.parse_and(firstArgument);

    return firstArgument;
  }

  private comparison() {
    const first_argument = this.primary_expression();

    if (this.is("comparison_operator") || this.is("function"))
      return this.parse_comparison(first_argument);

    return first_argument;
  }

  private parse_comparison(first_argument: IVisitable) {
    if (this.is("comparison_operator")) {
      const token = this.pop_expected("comparison_operator");
      const filter_node = this.primary_expression();

      return new ComparisonNode(token.value, first_argument, filter_node);
    }

    if (this.is("function")) return this.parse_function(first_argument);

    throw `Expected comparison operator or function. Got: ${this.peek()}`;
  }

  private parse_or(first_argument: IVisitable) {
    this.pop_expected("logical_operator");

    const filter_node = this.or();

    return new OrNode(first_argument, filter_node);
  }

  private parse_and(first_argument: IVisitable) {
    this.pop_expected("logical_operator");
    const filter_node = this.comparison();
    return new AndNode(first_argument, filter_node);
  }
}
