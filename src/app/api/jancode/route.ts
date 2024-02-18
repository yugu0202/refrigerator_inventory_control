import { NextResponse, NextRequest } from "next/server";
import { JSDOM } from 'jsdom';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const response = await fetch(`https://jancode.xyz/code/?q=${params.get('code')}`)
  const text = await response.text()
  const dom = new JSDOM(text);
  const resultText = dom.window.document.querySelector('p.description')?.textContent?.trim();

  return NextResponse.json({result: resultText || 'No result'})
};