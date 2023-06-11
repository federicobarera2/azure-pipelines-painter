import {
  ExpressionParserFunction,
  ExpressionToken,
  ExpressionTokenParserRespose,
  TokenType,
} from "./types";

export class ExpressionLexer {
  _comparison_operators: string[] = ["eq", "ne", "lt", "lte", "gt", "gte"];
  _logical_operators: string[] = ["and", "or", "not"];
  _flow_operators: string[] = ["if", "else", "elseif", "each", "insert"];
  _booleans: string[] = ["true", "false"];
  _functions: string[] = ["add", "sub", "mul", "div", "mod", "coalesce", "in", "notIn"];
  _separator = " ";
  _singleQuote = "'";
  _current_char_index = 0;
  _input: string;

  constructor(input: string) {
    //trim input and remove return and new line characters
    this._input = input.trim().replace(/(\r\n|\n|\r)/gm, "");
  }

  tokenize() {
    const token_list: ExpressionToken[] = [];
    const parsers: ExpressionParserFunction[] = [
      this.try_parse_identifier,
      this.try_parse_number,
      this.try_parse_string,
      this.try_parse_character("("),
      this.try_parse_character(")"),
      this.try_parse_character(","),
    ];

    while (this._current_char_index < this._input.length) {
      let token: ExpressionToken | undefined;

      parsers.find((f) => {
        const evaluation_result = f.apply(this);
        token = evaluation_result.token;

        return evaluation_result.success;
      });

      if (!token)
        throw `Expected token: ${this._input.substring(
          this._current_char_index
        )}`;
      token_list.push(token);
    }

    return token_list;
  }

  private is_comparison_op(value: string) {
    return this._comparison_operators.indexOf(value) > -1;
  }

  private is_logical_op(value: string) {
    return this._logical_operators.indexOf(value) > -1;
  }

  private is_flow_op(value: string) {
    return this._flow_operators.indexOf(value) > -1;
  }

  private is_boolean(value: string) {
    return this._booleans.indexOf(value.toLowerCase()) > -1;
  }

  private is_function(value: string) {
    return this._functions.indexOf(value) > -1;
  }

  private identifier(result: string): TokenType {
    if (result.toLowerCase() == "null") return "null";
    if (this.is_comparison_op(result)) return "function";
    if (this.is_logical_op(result)) return "function";
    if (this.is_flow_op(result)) return "flow_operator";
    if (this.is_boolean(result)) return "boolean";
    if (this.is_function(result)) return "function";

    return "property";
  }

  private peek(chars: number = 0) {
    if (this._current_char_index + chars < this._input.length)
      return this._input[this._current_char_index + chars];

    return "🔚";
  }

  private next() {
    ++this._current_char_index;
    return this.peek();
  }

  private skip_separators() {
    let ch = this.peek();
    while (ch === this._separator) {
      ch = this.next();
    }
  }

  private read(predicate: (x: string) => boolean, result: string) {
    for (let ch = this.peek(); predicate(ch); ch = this.next()) result += ch;
    return result;
  }

  private try_parse_character(char: string) {
    return (): ExpressionTokenParserRespose => {
      this.skip_separators();
      const ch = this.peek();

      if (ch != char) {
        return { success: false };
      }

      this.next();
      const tups: [string, TokenType][] = [
        ["(", "left_parenthesis"],
        [")", "right_parenthesis"],
        [",", "comma"],
      ];
      const tokenType = tups.find((x) => x[0] === ch)?.[1];

      if (!tokenType) throw "Unrecognised char token";

      return {
        success: true,
        token: {
          type: tokenType,
          value: ch,
        },
      };
    };
  }

  private try_parse_string(): ExpressionTokenParserRespose {
    this.skip_separators();
    if (this.peek() !== this._singleQuote) {
      return { success: false };
    }

    this.next();

    const value = this.read((ch) => {
      if (ch === "🔚") throw "Unterminated string";
      if (ch !== this._singleQuote || this.peek(1) !== this._singleQuote)
        return ch !== this._singleQuote;

      this.next();
      return true;
    }, "");

    this.next();

    return {
      success: true,
      token: {
        type: "string",
        value,
      },
    };
  }

  private try_parse_number(): ExpressionTokenParserRespose {
    this.skip_separators();
    let ch = this.peek();
    let result = "";
    let dot = 0;

    if (ch === "+" || ch === "-") {
      result += ch;
      ch = this.next();
    }

    if (ch === ".") {
      result += ch;
      ch = this.next();
    }

    if (isNaN(parseInt(ch))) return { success: false };

    const value = this.read((ch) => {
      if (ch === ".") {
        if (++dot > 1) throw "Invalid number";
        return true;
      }
      return !isNaN(parseInt(ch));
    }, result);

    return {
      success: true,
      token: {
        type: "number",
        value,
      },
    };
  }

  private try_parse_identifier(): ExpressionTokenParserRespose {
    this.skip_separators();
    let ch = this.peek();
    let result = "";

    if (!this.is_identifier_start(ch)) {
      return { success: false };
    }

    result += ch;
    this.next();

    result = this.read(
      (character) => this.is_identifier_part(character),
      result
    );

    return {
      success: true,
      token: {
        type: this.identifier(result),
        value: result,
      },
    };
  }

  private is_identifier_part(character: string) {
    return /[a-z0-9_.\[\]\']/i.test(character);
  }

  private is_identifier_start(character: string) {
    return /[a-z]/i.test(character);
  }
}
