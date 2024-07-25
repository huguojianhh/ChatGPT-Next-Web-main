// import { ACCESS_CODE_PREFIX, Difyai, ApiPath } from "@/app/constant";
// import { ChatOptions, getHeaders, LLMApi, MultimodalContent, } from "../api";
// import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";
// import { getClientConfig } from "@/app/config/client";
// import { DEFAULT_API_HOST } from "@/app/constant";
// import { RequestMessage } from "@/app/typing";
// import {
//   EventStreamContentType,
//   fetchEventSource,
// } from "@fortaine/fetch-event-source";
// import Locale from "../../locales";
// import { prettyObject } from "@/app/utils/format";
// import { getMessageTextContent, isVisionModel } from "@/app/utils";

// export type MultiBlockContent = {
//   type: "image" | "text" | "file";
//   file?: {
//     type: string;
//     data: string;
//   };
//   text?: string;
// };

// export type DifyaiMessage = {
//   role: (typeof ClaudeMapper)[keyof typeof ClaudeMapper];
//   content: string | MultiBlockContent[];
// };

// export interface DifyaiChatRequest {
//   query: string;
//   response_mode: "streaming" | "blocking";
//   inputs: Partial<Record<string, any>>;
//   conversation_id?: string;
//   user: string;
//   auto_generate_name?: boolean;
// }

// export interface ChatRequest {
//   model: string; // The model that will complete your prompt.
//   prompt: string; // The prompt that you want Claude to complete.
//   max_tokens_to_sample: number; // The maximum number of tokens to generate before stopping.
//   stop_sequences?: string[]; // Sequences that will cause the model to stop generating completion text.
//   temperature?: number; // Amount of randomness injected into the response.
//   top_p?: number; // Use nucleus sampling.
//   top_k?: number; // Only sample from the top K options for each subsequent token.
//   metadata?: object; // An object describing metadata about the request.
//   stream?: boolean; // Whether to incrementally stream the response using server-sent events.
// }

// export interface ChatResponse {
//   completion: string;
//   stop_reason: "stop_sequence" | "max_tokens";
//   model: string;
// }

// export type ChatStreamResponse = ChatResponse & {
//   stop?: string;
//   log_id: string;
// };

// const ClaudeMapper = {
//   assistant: "assistant",
//   user: "user",
//   system: "user",
// } as const;

// const keys = ["claude-2, claude-instant-1"];

// export class DifyaiApi implements LLMApi {
//   extractMessage(res: any) {
//     console.log("[Response] claude response: ", res);

//     return res?.content?.[0]?.text;
//   }
//   async chat(options: ChatOptions): Promise<void> {
//     const accessStore = useAccessStore.getState();

//     const shouldStream = !!options.config.stream;

//     const modelConfig = {
//       ...useAppConfig.getState().modelConfig,
//       ...useChatStore.getState().currentSession().mask.modelConfig,
//       ...{
//         model: options.config.model,
//       },
//     };
//     const messages = [...options.messages];

//     const prompt = messages
//       .flat()
//       .filter((v) => {
//         if (!v.content) return false;
//         if (typeof v.content === "string" && !v.content.trim()) return false;
//         return true;
//       })
//       .map((v) => {
//         const { role, content } = v;
//         const insideRole = ClaudeMapper[role] ?? "user";

//         if (typeof content === "string") {
//           return {
//             role: insideRole,
//             content: getMessageTextContent(v),
//           };
//         }
//         return {
//           role: insideRole,
//           content: content
//             .filter((v) => v.file || v.text)
//             .map(({ type, text, file }) => {
//               if (type === "text") {
//                 return {
//                   type,
//                   text: text!,
//                 };
//               }
//               const { url = "" } = file || {};
//               return {
//                 type: "file" as const,
//                 file: {
//                   type: 'file',
//                   data: url,
//                 },
//               };
//             }),
//         };
//       });
//     let lastInput = ''

//     if (typeof prompt[prompt.length - 1]?.content === 'string') {
//       lastInput = prompt[prompt.length - 1]?.content.toString()
//     } else if (prompt[prompt.length - 1]?.content[0]) {
//       lastInput = prompt[prompt.length - 1].content[0].text.toString()
//     }

//     let conversation_id = 'c67b25dc-09d3-440d-acce-128446e3da77'
//     const requestBody: DifyaiChatRequest = {
//       query: lastInput,
//       inputs: {},
//       response_mode: 'streaming',
//       conversation_id,
//       user: 'user-abc',
//     };

//     const path = this.path(Difyai.ChatPath);

//     const controller = new AbortController();
//     options.onController?.(controller);

//     const payload = {
//       method: "POST",
//       body: JSON.stringify(requestBody),
//       signal: controller.signal,
//       headers: {
//         ...getHeaders(),  // get common headers
//         // "Difyai-version": accessStore.anthropicApiVersion,
//         // do not send `anthropicApiKey` in browser!!!
//         // Authorization: getAuthKey(accessStore.anthropicApiKey),
//       },
//     };

//     if (shouldStream) {
//       try {
//         const context = {
//           text: "",
//           finished: false,
//         };

//         // animate response to make it looks smooth
//         function animateResponseText() {
//           if (context.finished || controller.signal.aborted) {
//             responseText += remainText;
//             console.log("[Response Animation] finished");
//             if (responseText?.length === 0) {
//               options.onError?.(new Error("empty response from server"));
//             }
//             return;
//           }

//           if (remainText.length > 0) {
//             const fetchCount = Math.max(1, Math.round(remainText.length / 60));
//             const fetchText = remainText.slice(0, fetchCount);
//             responseText += fetchText;
//             remainText = remainText.slice(fetchCount);
//             options.onUpdate?.(responseText, fetchText);
//           }

//           requestAnimationFrame(animateResponseText);
//         }

//         // start animaion
//         animateResponseText();

//         const finish = () => {
//           if (!context.finished) {
//             options.onFinish(context.text);
//             context.finished = true;
//           }
//         };

//         controller.signal.onabort = finish;
//         fetchEventSource(path, {
//           ...payload,
//           async onopen(res) {
//             const contentType = res.headers.get("content-type");
//             console.log("response content type: ", contentType);

//             if (contentType?.startsWith("text/plain")) {
//               context.text = await res.clone().text();
//               return finish();
//             }

//             if (
//               !res.ok ||
//               !res.headers
//                 .get("content-type")
//                 ?.startsWith(EventStreamContentType) ||
//               res.status !== 200
//             ) {
//               const responseTexts = [context.text];
//               let extraInfo = await res.clone().text();
//               try {
//                 const resJson = await res.clone().json();
//                 extraInfo = prettyObject(resJson);
//               } catch { }

//               if (res.status === 401) {
//                 responseTexts.push(Locale.Error.Unauthorized);
//               }

//               if (extraInfo) {
//                 responseTexts.push(extraInfo);
//               }

//               context.text = responseTexts.join("\n\n");

//               return finish();
//             }
//           },
//           onmessage(msg) {

//             try {
//               const text = msg.data;
//               const json = JSON.parse(text);

//               const { event, message_id, conversation_id, answer } = json

//               if (event === "message_end" || context.finished) {
//                 return finish();
//               }

//               // const choices = json.output.choices as Array<{
//               //   message: { content: string };
//               // }>;
//               const delta = answer;
//               if (delta) {
//                 context.text += delta;
//               }
//             } catch (e) {
//               console.error("[Request] parse error",   msg);
//             }
//           },
//           onclose() {
//             finish();
//           },
//           onerror(e) {
//             options.onError?.(e);
//             throw e;
//           },
//           openWhenHidden: true,
//         });
//       } catch (e) {
//         console.error("failed to chat", e);
//         options.onError?.(e as Error);
//       }
//     } else {
//       try {
//         controller.signal.onabort = () => options.onFinish("");

//         const res = await fetch(path, payload);
//         const resJson = await res.json();

//         const message = this.extractMessage(resJson);
//         options.onFinish(message);
//       } catch (e) {
//         console.error("failed to chat", e);
//         options.onError?.(e as Error);
//       }
//     }
//   }
//   async usage() {
//     return {
//       used: 0,
//       total: 0,
//     };
//   }
//   async models() {
//     // const provider = {
//     //   id: "Difyai",
//     //   providerName: "Difyai",
//     //   providerType: "Difyai",
//     // };

//     return [
//       // {
//       //   name: "claude-instant-1.2",
//       //   available: true,
//       //   provider,
//       // },
//       // {
//       //   name: "claude-2.0",
//       //   available: true,
//       //   provider,
//       // },
//       // {
//       //   name: "claude-2.1",
//       //   available: true,
//       //   provider,
//       // },
//       // {
//       //   name: "claude-3-opus-20240229",
//       //   available: true,
//       //   provider,
//       // },
//       // {
//       //   name: "claude-3-sonnet-20240229",
//       //   available: true,
//       //   provider,
//       // },
//       // {
//       //   name: "claude-3-haiku-20240307",
//       //   available: true,
//       //   provider,
//       // },
//     ];
//   }
//   path(path: string): string {
//     const accessStore = useAccessStore.getState();

//     let baseUrl: string = "";

//     if (accessStore.useCustomConfig) {
//       baseUrl = accessStore.anthropicUrl;
//     }

//     // if endpoint is empty, use default endpoint
//     if (baseUrl.trim().length === 0) {
//       const isApp = !!getClientConfig()?.isApp;

//       baseUrl = isApp
//         ? DEFAULT_API_HOST + "/api/proxy/Difyai"
//         : ApiPath.Difyai;
//     }

//     if (!baseUrl.startsWith("http") && !baseUrl.startsWith("/api")) {
//       baseUrl = "https://" + baseUrl;
//     }

//     baseUrl = trimEnd(baseUrl, "/");

//     return `${baseUrl}/${path}`;
//   }
// }

// function trimEnd(s: string, end = " ") {
//   if (end.length === 0) return s;

//   while (s.endsWith(end)) {
//     s = s.slice(0, -end.length);
//   }

//   return s;
// }
