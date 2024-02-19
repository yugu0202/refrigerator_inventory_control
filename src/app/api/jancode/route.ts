import { NextResponse, NextRequest } from "next/server";
import { JSDOM } from 'jsdom';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  if (!params.has('code')) {
    return NextResponse.json({name: 'codeパラメータが必要です'}, {status: 400})
  }

  const code = params.get('code');

  if (code?.length !== 13 && !code?.match(/^\d+$/)) {
    return NextResponse.json({name: 'JANコードが不正です'}, {status: 400})
  }

  const response = await fetch(`https://jancode.xyz/code/?q=${params.get('code')}`)
  const text = await response.text()
  const dom = new JSDOM(text);
  const resultText = dom.window.document.querySelector('p.description')?.textContent?.trim();

  if (!resultText) {
    return NextResponse.json({name: '商品が見つかりませんでした'}, {status: 404})
  }
  return NextResponse.json({name: resultText})
};