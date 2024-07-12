import { NextRequest, NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";
import md5 from "spark-md5";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  defaultModel: serverConfig.defaultModel,
};


async function handle(
  req: NextRequest
) {
  console.log("[auth Route] params ", req);

  let body
  if (req.method === "POST") {
    body = await req.json();
    console.log("[auth Route] body", body);

    // 您的处理逻辑
  }

  console.log("[auth Route] params ", body);

  const { accessCode, accessUserName } = body
  console.log('aaaaaaaaa', accessUserName, accessCode)
  const hashedCode = md5.hash(accessCode ?? "").trim();
  const serverConfig = getServerSideConfig();

  console.log([...serverConfig.accessUserName])
  console.log("[Auth] allowed hashed userName: ", serverConfig.accessUserName);
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[Time] ", new Date().toLocaleString());
  let resp

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode)) {
  // if (serverConfig.needCode && (!serverConfig.codes.has(hashedCode) || accessUserName != serverConfig.accessUserName)) {
    resp = {
      error: true,
      msg: !accessCode ? "empty access code" : "wrong access code",
    };
  } else {
    resp = {
      error: false
    };
  }
  return NextResponse.json(resp)
}


export const GET = handle;
export const POST = handle;

export const runtime = "edge";
