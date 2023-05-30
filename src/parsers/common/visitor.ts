export interface IVisitable {
  accept(visitor: IVisitor): void;
}

export interface IVisitor {
  visit(node: IVisitable): void;
  start_visit(node: IVisitable): void;
  end_visit(): void;
}
