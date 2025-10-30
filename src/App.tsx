import { useEffect, useRef, useState } from "react";
import "./App.css";

type ViewerInstance = { distory: () => void } | null;

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<ViewerInstance>(null);
  const [fileName, setFileName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.distory();
        viewerRef.current = null;
      }
    };
  }, []);

  const handleFile = async (file: File) => {
    setNotice("");
    setFileName(file.name);
    const lower = file.name.toLowerCase();

    // 이전 뷰어 제거
    if (viewerRef.current) {
      viewerRef.current.distory();
      viewerRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    if (lower.endsWith(".hwp")) {
      const buf = new Uint8Array(await file.arrayBuffer());
      const { Viewer } = (await import("hwp.js")) as unknown as {
        Viewer: new (
          container: HTMLElement,
          data: Uint8Array,
          option?: { type: string }
        ) => { distory: () => void };
      };
      if (containerRef.current) {
        viewerRef.current = new Viewer(containerRef.current, buf, {
          type: "array",
        });
        setDisplayName(file.name);
      }
      return;
    }

    if (lower.endsWith(".hwpx")) {
      // 요청: 확장자만 변경했다고 가정하고 Viewer에 그대로 시도해보기
      const renamed = file.name.replace(/\.hwpx$/i, ".hwp");
      setDisplayName(renamed);

      try {
        const buf = new Uint8Array(await file.arrayBuffer());
        const { Viewer } = (await import("hwp.js")) as unknown as {
          Viewer: new (
            container: HTMLElement,
            data: Uint8Array,
            option?: { type: string }
          ) => { distory: () => void };
        };
        if (containerRef.current) {
          viewerRef.current = new Viewer(containerRef.current, buf, {
            type: "array",
          });
          setNotice(
            "확장자만 변경하여 렌더링을 시도했습니다. 문서가 비정상일 수 있습니다."
          );
        }
      } catch {
        setNotice(
          "확장자만 바꿔서는 렌더링이 불가합니다. (HWPX는 포맷이 다름)"
        );
      }
      return;
    }

    setDisplayName("");
    setNotice("지원하지 않는 파일 형식입니다. (*.hwp, *.hwpx)");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          padding: 12,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept=".hwp,.hwpx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {displayName && (
          <span style={{ fontWeight: 600 }}>표시 이름: {displayName}</span>
        )}
        {fileName && (
          <span style={{ color: "#6b7280" }}>(원본: {fileName})</span>
        )}
        {notice && (
          <span style={{ marginLeft: "auto", color: "#b45309" }}>{notice}</span>
        )}
      </header>
      <main style={{ flex: 1, minHeight: 0 }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </main>
    </div>
  );
}

export default App;
