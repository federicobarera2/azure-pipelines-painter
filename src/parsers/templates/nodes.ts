import { IVisitable, IVisitor } from "../common/visitor";

export class StageNode implements IVisitable {
  constructor(public name: string) {}

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    visitor.visit(this);
    visitor.end_visit();
  }
}

export class StepsNode implements IVisitable {
  steps: IVisitable[] = [];

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);
    for (const stage of this.steps) {
      stage.accept(visitor);
    }
    visitor.visit(this);
    visitor.end_visit();
  }
}

export class TemplateNode implements IVisitable {
  constructor(public name: string) {}
  value?: IVisitable;
  parameters?: Record<string, any>;

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);

    this.value?.accept(visitor);

    visitor.visit(this);
    visitor.end_visit();
  }
}

export class ExpressionNode implements IVisitable {
  value?: IVisitable;
  expression?: string;
  operator?: string;

  constructor() {}

  accept(visitor: IVisitor): void {
    visitor.start_visit(this);

    this.value?.accept(visitor);

    visitor.visit(this);
    visitor.end_visit();
  }
}
