import { createParser, type EventSourceParser } from "eventsource-parser";

export interface StreamRequestOptions {
  functionUrl: string;
  requestBody: unknown;
  supabaseAnonKey: string;
  onData: (data: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * 使用标准 fetch 发送 SSE 流式请求，避免 ky afterResponse hook 冲突。
 */
export async function sendStreamRequest(options: StreamRequestOptions): Promise<void> {
  const {
    functionUrl,
    requestBody,
    supabaseAnonKey,
    onData,
    onComplete,
    onError,
    signal,
  } = options;

  let response: Response;
  try {
    response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal,
    });
  } catch (error) {
    if (!signal?.aborted) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
    return;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => `HTTP ${response.status}`);
    onError(new Error(`请求失败 (${response.status}): ${errText}`));
    return;
  }

  if (!response.body) {
    onError(new Error("响应体为空"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf8");
  let buffer = "";
  let completed = false;

  const finish = (error?: Error): void => {
    if (completed) return;
    completed = true;
    if (error) onError(error);
    else onComplete();
  };

  const parser: EventSourceParser = createParser({
    onEvent: (event) => {
      if (!event.data) return;
      for (const chunk of event.data.split("\n")) {
        onData(chunk.trim());
      }
    },
  });

  const read = (): void => {
    reader
      .read()
      .then((result) => {
        if (result.done) {
          finish();
          return;
        }
        buffer += decoder.decode(result.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          parser.feed(line + "\n");
        }
        read();
      })
      .catch((error) => {
        if (signal?.aborted) {
          console.log("请求已中断");
          return;
        }
        finish(error instanceof Error ? error : new Error(String(error)));
      });
  };

  read();
}
