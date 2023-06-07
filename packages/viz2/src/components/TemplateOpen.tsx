import { useCallback, useEffect } from "react";
import { directoryOpen } from "browser-fs-access";
import { evaluateExpression } from "azpp-common/parsers/templates/utils";
export default function TemplateOpen() {
  const res = evaluateExpression({}, "add(1,1)");

  const open = useCallback(async () => {
    const result = await directoryOpen({
      recursive: true,
    });

    console.log(result);
  }, []);

  return (
    <div className="flex gap-2 cursor-pointer">
      <div>Open</div>
      <div>Eval test: {res}</div>
    </div>
  );
}
