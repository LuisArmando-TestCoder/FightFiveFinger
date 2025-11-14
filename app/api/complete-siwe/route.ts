import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export const POST = async (req: NextRequest) => {
  const { payload, nonce } = (await req.json()) as IRequestPayload;
  const cookieNonce = cookies().get("siwe")?.value;

  if (!cookieNonce || nonce !== cookieNonce) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce.",
    }, { status: 400 });
  }

  try {
    // Note: `verifySiweMessage` is an async function
    const validMessage = await verifySiweMessage(payload, nonce);
    
    // Clear the nonce after successful verification
    cookies().delete("siwe");

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    });
  } catch (error: any) {
    // Handle errors in validation or processing
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: error.message || "An unknown error occurred.",
    }, { status: 500 });
  }
};
