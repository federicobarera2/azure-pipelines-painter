import { useCallback, useEffect, useRef } from "react";
import { FileWithHandle, fileOpen } from "browser-fs-access";
import { evaluateExpression } from "azpp-common/parsers/templates/utils";
import { openPipeline } from "@/actions/pipelines";

const readPromise = (file: FileWithHandle) => {
  var reader = new FileReader();
  const p = new Promise((resolve, reject) => {
    reader.addEventListener("load", () => {
      resolve(reader.result);
    });
    reader.addEventListener("error", reject);
  });
  reader.readAsText(file);

  return p;
};

export default function TemplateOpen() {
  const res = evaluateExpression({}, "add(1,1)");

  const input = useRef<HTMLInputElement>(null);

  const open = useCallback(async () => {
    // const file = await fileOpen();
    // console.log(await readPromise(file));

    const s = await openPipeline(input.current?.value || "");
    console.log(s);
  }, []);

  return (
    <div className="flex gap-2 cursor-pointer my-1  ">
      <input
        type="text"
        ref={input}
        className="border-gray-400 border-2 rounded-md"
      />
      <div onClick={open}>Open</div>
      <div>Eval test: {res}</div>
    </div>
  );
}
